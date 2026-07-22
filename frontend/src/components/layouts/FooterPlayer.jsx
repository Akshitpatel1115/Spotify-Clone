import { useState, useRef, useEffect } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2, 
  FiHeart, 
  FiMaximize2 
} from "react-icons/fi";

const FooterPlayer = () => {
  const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayer();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const current = audio.currentTime;
    const total = audio.duration || 0;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(formatTime(audio.duration));
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

  const handleSeek = (e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = getClientX(e) - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const onSeekStart = (e) => {
    if (!e.touches) e.preventDefault(); // Prevent default only for mouse to avoid passive event warning on touch
    handleSeek(e);
    const onMove = (eMove) => handleSeek(eMove);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  const handleVolumeChange = (e) => {
    if (!volumeBarRef.current || !audioRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = getClientX(e) - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percent);
    audioRef.current.volume = percent;
  };

  const onVolumeStart = (e) => {
    if (!e.touches) e.preventDefault();
    handleVolumeChange(e);
    const onMove = (eMove) => handleVolumeChange(eMove);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <footer className="h-24 w-full bg-[#181818] border-t border-border flex items-center justify-between px-4 sm:px-6 relative z-50">
      
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-surface-hover shrink-0 hidden sm:block">
          {/* Dummy image - standard SONEXA practice */}
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" 
            alt="Album cover" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-[200px]">
            {currentSong.title}
          </h4>
          <p className="text-xs text-text-secondary truncate max-w-[120px] sm:max-w-[200px]">
            {currentSong.artist?.username || currentSong.artist || "Unknown Artist"}
          </p>
        </div>
        <button className="text-text-secondary hover:text-white transition hidden sm:block ml-2">
          <FiHeart className="text-lg" />
        </button>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={playPrevious}
            className="text-text-secondary hover:text-white transition active:scale-95"
          >
            <FiSkipBack className="text-xl" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <FiPause className="text-xl fill-black" />
            ) : (
              <FiPlay className="text-xl fill-black ml-1" />
            )}
          </button>

          <button 
            onClick={playNext}
            className="text-text-secondary hover:text-white transition active:scale-95"
          >
            <FiSkipForward className="text-xl" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-text-secondary w-10 text-right">{currentTime}</span>
          <div 
            ref={progressBarRef}
            onMouseDown={onSeekStart}
            onTouchStart={onSeekStart}
            className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-surface-hover"
          >
            <div 
              className="absolute top-0 left-0 h-full rounded-full bg-primary group-hover:bg-primary-hover transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-text-secondary w-10">{duration}</span>
        </div>
      </div>

      {/* Right: Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-1/3 text-text-secondary hidden md:flex">
        <FiVolume2 className="text-lg" />
        <div 
          ref={volumeBarRef}
          onMouseDown={onVolumeStart}
          onTouchStart={onVolumeStart}
          className="group relative h-1.5 w-24 cursor-pointer rounded-full bg-surface-hover"
        >
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-white group-hover:bg-primary transition-all duration-100"
            style={{ width: `${volume * 100}%` }}
          ></div>
          <div 
            className="absolute top-1/2 -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            style={{ left: `${volume * 100}%` }}
          ></div>
        </div>
        <button className="hover:text-white transition ml-2">
          <FiMaximize2 className="text-lg" />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentSong.uri}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />
    </footer>
  );
};

export default FooterPlayer;
