import { createContext, useState, useContext, useMemo } from "react";

const PlayerContext = createContext();

export const usePlayer = () => {
  return useContext(PlayerContext);
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const stopSong = () => {
    setCurrentSong(null);
    setIsPlaying(false);
  };

  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    stopSong,
    setIsPlaying,
  }), [currentSong, isPlaying]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
