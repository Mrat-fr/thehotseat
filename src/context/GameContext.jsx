import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const PRESETS = [
  "Pineapple belongs on pizza",
  "Social media has done more harm than good",
  "Cancel culture has gone too far",
  "The monarchy should be abolished",
  "WFH is better for productivity",
  "Reality TV is genuinely good entertainment",
];
const CATS = ["Politics & Society", "Relationships & Dating", "Food & Lifestyle", "Pop Culture"];

// Stages in order
const STAGES = ['lobby', 'yesno', 'hotseat', 'photo'];

function blank() {
  return {
    stage: 'lobby',        // current stage
    questionIndex: 0,      // current question within yesno stage
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
    // legacy compat
    phase: 'lobby',
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function voteCount(votes, v) {
  return Object.values(votes || {}).filter(x => x === v).length;
}

function getWsUrl() {
  const host = window.location.hostname;
  return `ws://${host}:3001`;
}

const GameContext = createContext(null);

const myPid = sessionStorage.getItem('hs_pid2') || (() => {
  const id = Math.random().toString(36).slice(2, 9);
  sessionStorage.setItem('hs_pid2', id);
  return id;
})();

export function GameProvider({ children }) {
  const [game, setGameRaw] = useState(blank);
  const [connected, setConnected] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState('');
  const gameRef = useRef(game);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('Connected to Hot Seat server');
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'state') {
            gameRef.current = msg.state;
            setGameRaw(msg.state);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectRef.current = setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  const sendUpdate = useCallback((state) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'update', state }));
    }
  }, []);

  const setGame = useCallback((updater) => {
    setGameRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      gameRef.current = next;
      sendUpdate(next);
      return next;
    });
  }, [sendUpdate]);

  // Start the game (leave lobby, go to first real stage)
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

  // Next question within Yes/No stage
  const nextQuestion = useCallback(() => {
    setGame(prev => {
      const nextIdx = prev.questionIndex + 1;
      if (nextIdx >= prev.presets.length) return prev; // no more questions
      const q = prev.presets[nextIdx];
      return {
        ...prev,
        questionIndex: nextIdx,
        pollHistory: prev.poll ? [...(prev.pollHistory || []), { ...prev.poll, closed: true }] : prev.pollHistory,
        poll: { question: q, votes: {}, closed: false },
      };
    });
  }, [setGame]);

  // Skip to next stage
  const skipStage = useCallback(() => {
    setGame(prev => {
      const currentStageIdx = STAGES.indexOf(prev.stage);
      if (currentStageIdx < 0 || currentStageIdx >= STAGES.length - 1) return prev;
      const nextStage = STAGES[currentStageIdx + 1];
      const next = { ...prev, stage: nextStage };

      // Clean up when leaving yesno
      if (prev.stage === 'yesno' && prev.poll) {
        next.pollHistory = [...(prev.pollHistory || []), { ...prev.poll, closed: true }];
        next.poll = null;
      }

      // Set phase for player view compat
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

  // Close the current poll
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
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
    }
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
