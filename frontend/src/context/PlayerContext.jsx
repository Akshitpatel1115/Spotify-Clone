import { createContext, useState, useContext, useMemo } from "react";

const PlayerContext = createContext();

export const usePlayer = () => {
  return useContext(PlayerContext);
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);

  const playSong = (song, newQueue = []) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else if (queue.length === 0) {
      setQueue([song]);
    }
  };

  const playNext = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % queue.length;
      playSong(queue[nextIndex], queue);
    }
  };

  const playPrevious = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      playSong(queue[prevIndex], queue);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const stopSong = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
  };

  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    queue,
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    stopSong,
    setIsPlaying,
  }), [currentSong, isPlaying, queue]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
