import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src: string;
  title?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PreviewPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const onError = () => {
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
      console.error('Preview failas neužsikrovė:', src);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Nepavyko paleisti preview:', err);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const audio = audioRef.current;
    if (!audio || !duration) return;

    const value = Number(e.target.value);
    const newTime = (value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="preview-player">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        className={`preview-play-button ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pauzė' : 'Groti'}
      >
        <span className="preview-play-icon">{isPlaying ? '❚❚' : '▶'}</span>
      </button>

      <div className="preview-main">
        <div className="preview-top-row">
          <span className="preview-label">
            {title ? `Preview · ${title}` : 'Preview'}
          </span>
          <span className="preview-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="preview-progress-wrap">
          <div
            className="preview-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>

          <input
            className="preview-progress"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
          />
        </div>
      </div>
    </div>
  );
}