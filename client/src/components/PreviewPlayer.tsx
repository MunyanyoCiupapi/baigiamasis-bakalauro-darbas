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

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px', marginLeft: '4px' }}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export default function PreviewPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    const onError = () => {
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '18px', 
      width: '100%',
      background: 'transparent', 
      padding: '8px 0' 
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pauzė' : 'Groti'}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          width: '48px', height: '48px', minWidth: '48px',
          borderRadius: '50%', border: 'none',
          background: isPlaying 
            ? 'rgba(56, 189, 248, 0.15)' 
            : 'linear-gradient(135deg, #6366f1, #3b82f6)',
          color: isPlaying ? '#38bdf8' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, margin: 0,
          boxShadow: isPlaying ? 'none' : (isHovering ? '0 6px 16px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(59, 130, 246, 0.2)'),
          transform: isHovering && !isPlaying ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease'
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span className="preview-label" style={{ 
            fontSize: '1rem', 
            color: '#fff', 
            fontWeight: '700', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            paddingRight: '12px' 
          }}>
            {title || 'Audio Preview'}
          </span>
          <span className="preview-time" style={{ 
            fontSize: '0.8rem', 
            color: '#94a3b8', 
            fontWeight: '600', 
            fontVariantNumeric: 'tabular-nums', 
            flexShrink: 0,
            letterSpacing: '0.05em'
          }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
          
          <div style={{ 
            position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, 
            background: 'linear-gradient(90deg, #6366f1, #38bdf8)', 
            borderRadius: '3px', pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
          }} />
          
          <div style={{
            position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)',
            width: '14px', height: '14px', background: '#fff', borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)', pointerEvents: 'none', 
            opacity: progress > 0 ? 1 : 0, transition: 'opacity 0.2s'
          }} />
          
          <input
            type="range"
            min="0" max="100" step="0.1"
            value={progress}
            onChange={handleSeek}
            style={{
              position: 'absolute', top: '-10px', left: 0, width: '100%', height: '26px', 
              opacity: 0, cursor: 'pointer', margin: 0
            }}
          />
        </div>
      </div>
    </div>
  );
}