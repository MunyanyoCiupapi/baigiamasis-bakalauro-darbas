import { useEffect, useRef, useState } from 'react';
import type { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  songs: Song[];
  onPrev: () => void;
  onNext: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Player({ currentSong, onPrev, onNext }: PlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [currentSong]);

  useEffect(() => {
    if (playing && currentSong) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= currentSong.duration) {
            clearInterval(intervalRef.current!);
            setPlaying(false);
            return currentSong.duration;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, currentSong]);

  const progressPct = currentSong ? (progress / currentSong.duration) * 100 : 0;

  return (
    <div className="player">
      <div className="player-song">
        {currentSong ? (
          <>
            <img src={currentSong.coverUrl} alt={currentSong.title} className="player-cover" />
            <div className="player-song-info">
              <span className="player-title">{currentSong.title}</span>
              <span className="player-artist">{currentSong.artist}</span>
            </div>
          </>
        ) : (
          <span className="player-empty">No song selected</span>
        )}
      </div>

      <div className="player-controls">
        <button className="ctrl-btn" onClick={onPrev} disabled={!currentSong}>⏮</button>
        <button
          className="ctrl-btn ctrl-btn--play"
          onClick={() => setPlaying((p) => !p)}
          disabled={!currentSong}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button className="ctrl-btn" onClick={onNext} disabled={!currentSong}>⏭</button>
      </div>

      <div className="player-progress-area">
        <span className="player-time">{formatDuration(progress)}</span>
        <div className="player-progress-bar" onClick={(e) => {
          if (!currentSong) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          setProgress(Math.round(ratio * currentSong.duration));
        }}>
          <div className="player-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="player-time">{currentSong ? formatDuration(currentSong.duration) : '0:00'}</span>
      </div>

      <div className="player-volume">
        🔊
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
