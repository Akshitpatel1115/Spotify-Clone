import { useState } from "react";
import { FiPlay, FiPause, FiMusic, FiTrash2 } from "react-icons/fi";
import { usePlayer } from "../../context/PlayerContext";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteMusic, getAllAlbums } from "../../services/musicService";

const MusicCard = ({ song = {}, queue = [], viewMode = "grid", onDelete }) => {
  const { currentSong, isPlaying, playSong, togglePlay, stopSong } = usePlayer();
  const { user } = useAuth();
  const toast = useToast();
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const isCurrentSong = currentSong?._id === song._id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const title = song.title || "Midnight City";
  const artist = song.artist?.username || song.artist || "Unknown Artist";

  const artistId = song.artist?._id ? song.artist._id.toString() : song.artist?.toString();
  const userId = user?._id ? user._id.toString() : user?.id?.toString();
  const isOwner = user?.role === 'artist' && Boolean(userId) && Boolean(artistId) && userId === artistId;

  const initiateDelete = async (e) => {
    e.stopPropagation();
    try {
      // Check if song is in any album
      const albums = await getAllAlbums();
      const myAlbums = albums.filter(a => {
        const aArtistId = a.artist?._id ? a.artist._id.toString() : a.artist?.toString();
        return aArtistId === userId;
      });
      const isInAlbum = myAlbums.some(album => 
        album.musics && album.musics.some(m => m === song._id || m._id === song._id)
      );

      setConfirmMessage(isInAlbum 
        ? "This track is currently in one or more of your albums. Deleting it will also remove it from those albums. Are you sure you want to delete it?"
        : "Are you sure you want to delete this track?"
      );
      setIsConfirmOpen(true);
    } catch (error) {
      console.error("Failed to check albums:", error);
      toast.error("Failed to verify albums before deletion.");
    }
  };

  const executeDelete = async () => {
    try {
      await deleteMusic(song._id);
      if (isCurrentSong) {
        stopSong();
      }
      setIsConfirmOpen(false);
      toast.success("Track deleted successfully");
      if (onDelete) onDelete(song._id);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(error.response?.data?.message || "Failed to delete track");
      setIsConfirmOpen(false);
    }
  };

  if (viewMode === "list") {
    return (
      <div 
        onClick={() => {
          if (isCurrentSong) togglePlay();
          else playSong(song, queue);
        }}
        className={`group relative flex items-center gap-4 rounded-xl p-3 transition-all duration-200 cursor-pointer border md:hidden ${
          isCurrentSong 
            ? "bg-surface-hover border-primary shadow-md shadow-primary/5" 
            : "bg-surface border-border/50 hover:bg-surface-hover hover:border-border"
        }`}
      >
        <div className="relative h-14 w-14 shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-surface-hover to-background">
          <FiMusic className="text-2xl text-text-secondary/50 group-hover:text-primary/50 transition-colors" />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 ${
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
             <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrentSong) togglePlay();
                else playSong(song, queue);
              }}
              className="text-white"
            >
              {isCurrentlyPlaying ? <FiPause className="fill-white" /> : <FiPlay className="fill-white" />}
             </button>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className={`truncate text-sm font-semibold ${isCurrentSong ? "text-primary" : "text-white"}`}>{title}</h3>
            {isCurrentlyPlaying && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(30,215,96,0.8)]"></span>
            )}
          </div>
          <p className="truncate text-xs text-text-secondary mt-0.5">{artist}</p>
        </div>
        {isOwner && (
          <button 
            onClick={initiateDelete}
            className="flex items-center justify-center p-2 text-text-secondary hover:text-red-500 transition-colors ml-auto md:ml-0"
            title="Delete Track"
          >
            <FiTrash2 />
          </button>
        )}
        <ConfirmDialog 
          isOpen={isConfirmOpen}
          title="Delete Track"
          message={confirmMessage}
          onConfirm={executeDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => {
        if (isCurrentSong) togglePlay();
        else playSong(song, queue);
      }}
      className={`group relative flex flex-col gap-3 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer border ${
        isCurrentSong 
          ? "bg-surface-hover border-primary shadow-lg shadow-primary/10" 
          : "bg-surface border-border/50 hover:bg-surface-hover hover:shadow-lg hover:shadow-primary/5 hover:border-border"
      }`}
    >
      {/* Icon Placeholder */}
      <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-surface-hover to-background">
        <FiMusic className="text-5xl text-text-secondary/50 group-hover:text-primary/50 transition-colors duration-300" />
        
        {/* Delete Button - Top Right */}
        {isOwner && (
          <button 
            onClick={initiateDelete}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white md:text-text-secondary opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300 z-10 shadow-md"
            title="Delete Track"
          >
            <FiTrash2 className="text-sm" />
          </button>
        )}
        
        {/* Play Button Overlay */}
        <div className={`absolute bottom-2 right-2 translate-y-4 transition-all duration-300 group-hover:translate-y-0 ${
          isCurrentSong ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100"
        }`}>
          <div className="flex flex-col gap-2 items-center">
            <button 
              onClick={(e) => {
              e.stopPropagation();
              if (isCurrentSong) togglePlay();
              else playSong(song, queue);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-105 hover:bg-primary-hover active:scale-95"
          >
            {isCurrentlyPlaying ? (
              <FiPause className="text-xl fill-black" />
            ) : (
              <FiPlay className="ml-1 text-xl fill-black" />
            )}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className={`truncate text-base font-semibold ${isCurrentSong ? "text-primary" : "text-white"}`}>
            {title}
          </h3>
          {isCurrentlyPlaying && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(30,215,96,0.8)]"></span>
          )}
        </div>
        <p className="truncate text-sm text-text-secondary mt-1">
          {artist}
        </p>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Track"
        message={confirmMessage}
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default MusicCard;
