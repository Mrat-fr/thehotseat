'use client';

import { GameProvider } from './context/GameContext';

export default function Providers({ children }) {
  return <GameProvider>{children}</GameProvider>;
}
