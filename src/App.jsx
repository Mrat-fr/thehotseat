import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import PlayerView from './components/PlayerView';
import AdminView from './components/AdminView';
import RemoteView from './components/RemoteView';

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<AdminView />} />
          <Route path="/play" element={<PlayerView />} />
          <Route path="/remote" element={<RemoteView />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}
