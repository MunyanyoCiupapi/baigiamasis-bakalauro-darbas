import SongList from '../components/SongList';
import type { Song } from '../types';

interface HomeProps {
  onPlay: (song: Song) => void;
  currentSong: Song | null;
}

export default function Home({ onPlay, currentSong }: HomeProps) {
  return (
    <div className="page">
      <div className="welcome">
        <h1>Welcome to <span className="accent">Melodify</span></h1>
        <p>Discover and enjoy your favourite music.</p>
      </div>
      <h2 className="section-title">All Songs</h2>
      <SongList onPlay={onPlay} currentSong={currentSong} />
    </div>
  );
}
