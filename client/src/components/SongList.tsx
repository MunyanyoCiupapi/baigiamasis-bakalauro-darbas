import { useEffect, useState } from 'react';
import type { Song } from '../types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SongListProps {
  onPlay: (song: Song) => void;
  currentSong: Song | null;
}

export default function SongList({ onPlay, currentSong }: SongListProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/songs')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch songs');
        return r.json();
      })
      .then((data: Song[]) => {
        setSongs(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading songs...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="song-list">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`song-item${currentSong?.id === song.id ? ' song-item--active' : ''}`}
          onClick={() => onPlay(song)}
        >
          <img src={song.coverUrl} alt={song.title} className="song-cover" />
          <div className="song-info">
            <span className="song-title">{song.title}</span>
            <span className="song-artist">{song.artist}</span>
            <span className="song-album">{song.album}</span>
          </div>
          <span className="song-genre">{song.genre}</span>
          <span className="song-duration">{formatDuration(song.duration)}</span>
        </div>
      ))}
    </div>
  );
}
