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

function blank() {
  return {
    phase: 'lobby',
    step: 0,
    players: {},
    poll: null,
    pollHistory: [],
    hotSeat: { candidates: [], selected: null, category: null },
    photos: [],
    currentPhoto: null,
    presets: PRESETS.slice(),
    categories: CATS.slice(),
    adminPin: '1234',
  };
}

function getSteps(presets) {
  return [
    { phase: 'lobby', label: 'Welcome lobby' },
    ...presets.map((q, i) => ({ phase: 'part1', label: `Poll: "${q.slice(0, 30)}…"`, idx: i })),
    { phase: 'part2', label: 'Hot Seat — volunteers' },
    { phase: 'part2b', label: 'Hot Seat — pick & reveal' },
    { phase: 'part3', label: 'Photo Takeover' },
  ];
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function voteCount(votes, v) {
  return Object.values(votes || {}).filter(x => x === v).length;
}

// Determine WebSocket URL based on current page location
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
  const [adminTab, setAdminTab] = useState('live');
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState('');
  const gameRef = useRef(game);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  // Connect to WebSocket server
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
        // Auto-reconnect after 1 second
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

  // Send state update to server
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

  const advance = useCallback(() => {
    setGame(prev => {
      const allSteps = getSteps(prev.presets);
      const ni = (prev.step || 0) + 1;
      if (ni >= allSteps.length) return prev;
      const s = allSteps[ni];
      const next = { ...prev, step: ni, phase: s.phase };
      if (s.phase === 'part1' && s.idx !== undefined) {
        if (prev.poll) next.pollHistory = [...(prev.pollHistory || []), { ...prev.poll, closed: true }];
        next.poll = { question: prev.presets[s.idx], votes: {}, closed: false };
      }
      if (s.phase === 'part2' && prev.poll) {
        next.pollHistory = [...(prev.pollHistory || []), { ...prev.poll, closed: true }];
        next.poll = null;
      }
      return next;
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
    setAdminTab('live');
  }, []);

  const value = {
    game, setGame, connected,
    adminTab, setAdminTab,
    spinning, spinLabel,
    myPid, advance, doPickHotSeat, resetAll,
    getSteps, voteCount, uid, blank,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
