'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';

const PRESETS = [
  "Is a thumb a finger?",
  "If you win the lottery today, does it make you a \"successful\" person?",
  "Is cereal a soup?",
  "Is a cheesecake a cake or a pie?",
  "If a tomato is a fruit, is ketchup a smoothie?",
  "Does the \"5-second rule\" actually exist?",
  "Is the \"Snooze\" button a gift or a curse?",
  "Is \"Camping\" a vacation or just \"paying to be homeless\" for a weekend?",
  "Is \"A.I. Art\" actually art?",
  "Is \"Working from Home\" more productive than the office?",
];
const CATS = ["Politics & Society", "Relationships & Dating", "Food & Lifestyle", "Pop Culture"];

const STAGES = ['lobby', 'yesno', 'hotseat', 'photo'];

function blank() {
  return {
    stage: 'lobby',
    questionIndex: 0,
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
    phase: 'lobby',
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function voteCount(votes, v) {
  return Object.values(votes || {}).filter(x => x === v).length;
}

const GameContext = createContext(null);

function getMyPid() {
  if (typeof window === 'undefined') return 'server';
  const existing = sessionStorage.getItem('hs_pid2');
  if (existing) return existing;
  const id = Math.random().toString(36).slice(2, 9);
  sessionStorage.setItem('hs_pid2', id);
  return id;
}

export function GameProvider({ children }) {
  const [game, setGameRaw] = useState(blank);
  const [connected, setConnected] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState('');
  const [myPid] = useState(getMyPid);
  const gameRef = useRef(game);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher credentials not set. Real-time sync disabled.');
      return;
    }

    Pusher.logToConsole = false;
    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
    });

    pusherRef.current = pusher;
    const channel = pusher.subscribe('hotseat-game');
    channelRef.current = channel;

    channel.bind('state-update', (data) => {
      gameRef.current = data.state;
      setGameRaw(data.state);
    });

    pusher.connection.bind('connected', () => {
      setConnected(true);
      console.log('Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      setConnected(false);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('hotseat-game');
      pusher.disconnect();
    };
  }, []);

  const sendUpdate = useCallback((state) => {
    if (!channelRef.current) return;

    fetch('/api/game-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    }).catch(err => console.error('Failed to send update:', err));
  }, []);

  const setGame = useCallback((updater) => {
    setGameRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      gameRef.current = next;
      sendUpdate(next);
      return next;
    });
  }, [sendUpdate]);

  const startGame = useCallback(() => {
    setGame(prev => {
      const q = prev.presets[0];
      return {
        ...prev,
        stage: 'yesno',
        phase: 'part1',
        questionIndex: 0,
        poll: q ? { question: q, votes: {}, closed: false } : null,
      };
    });
  }, [setGame]);

  const nextQuestion = useCallback(() => {
    setGame(prev => {
      const nextIdx = prev.questionIndex + 1;
      if (nextIdx >= prev.presets.length) return prev;
      const q = prev.presets[nextIdx];
      return {
        ...prev,
        questionIndex: nextIdx,
        pollHistory: prev.poll ? [...(prev.pollHistory || []), { ...prev.poll, closed: true }] : prev.pollHistory,
        poll: { question: q, votes: {}, closed: false },
      };
    });
  }, [setGame]);

  const skipStage = useCallback(() => {
    setGame(prev => {
      const currentStageIdx = STAGES.indexOf(prev.stage);
      if (currentStageIdx < 0 || currentStageIdx >= STAGES.length - 1) return prev;
      const nextStage = STAGES[currentStageIdx + 1];
      const next = { ...prev, stage: nextStage };

      if (prev.stage === 'yesno' && prev.poll) {
        next.pollHistory = [...(prev.pollHistory || []), { ...prev.poll, closed: true }];
        next.poll = null;
      }

      if (nextStage === 'yesno') {
        next.phase = 'part1';
        next.questionIndex = 0;
        next.poll = prev.presets[0] ? { question: prev.presets[0], votes: {}, closed: false } : null;
      } else if (nextStage === 'hotseat') {
        next.phase = 'part2';
        next.hotSeat = { candidates: [], selected: null, category: null };
      } else if (nextStage === 'photo') {
        next.phase = 'part3';
      }

      return next;
    });
  }, [setGame]);

  const closePoll = useCallback(() => {
    setGame(prev => {
      if (!prev.poll) return prev;
      return { ...prev, poll: { ...prev.poll, closed: true } };
    });
  }, [setGame]);

  const doPickHotSeat = useCallback(() => {
    const candidates = gameRef.current.hotSeat.candidates;
    if (!candidates.length) return;
    setSpinning(true);
    let i = 0;
    const iv = setInterval(() => {
      const p = candidates[Math.floor(Math.random() * candidates.length)];
      setSpinLabel((gameRef.current.players[p] || {}).name || '?');
      i++;
      if (i > 22) {
        clearInterval(iv);
        const final = candidates[Math.floor(Math.random() * candidates.length)];
        setSpinning(false);
        setSpinLabel('');
        setGame(s => ({
          ...s,
          hotSeat: { ...s.hotSeat, selected: final, category: null },
          phase: 'part2b',
        }));
      }
    }, 90);
  }, [setGame]);

  const resetAll = useCallback(() => {
    fetch('/api/game-reset', { method: 'POST' }).catch(err => console.error('Reset failed:', err));
  }, []);

  const value = {
    game, setGame, connected,
    spinning, spinLabel,
    myPid, startGame, nextQuestion, skipStage, closePoll,
    doPickHotSeat, resetAll,
    voteCount, uid, blank,
    STAGES,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
