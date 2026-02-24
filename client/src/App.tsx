import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import Artists from './pages/Artists';
import type { Song } from './types';
import './App.css';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/songs')
      .then((r) => r.json())
      .then((data: Song[]) => setSongs(data))
      .catch(() => {});
  }, []);

  const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentSong(songs[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) setCurrentSong(songs[currentIndex + 1]);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onPlay={setCurrentSong} currentSong={currentSong} />} />
            <Route path="/artists" element={<Artists />} />
          </Routes>
        </main>
        <Player
          currentSong={currentSong}
          songs={songs}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
