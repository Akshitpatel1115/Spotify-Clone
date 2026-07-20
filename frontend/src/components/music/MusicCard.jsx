import { FiPlay, FiPause, FiMusic, FiTrash2 } from "react-icons/fi";
import { usePlayer } from "../../context/PlayerContext";
import useAuth from "../../context/useAuth";
import { deleteMusic } from "../../services/musicService";

const MusicCard = ({ song = {}, viewMode = "grid", onDelete }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { user } = useAuth();
  const isCurrentSong = currentSong?._id === song._id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const title = song.title || "Midnight City";
  const artist = song.artist?.username || song.artist || "Unknown Artist";

  const artistId = song.artist?._id || song.artist;
  const userId = user?.id || user?._id;
  const isOwner = userId && artistId && userId.toString() === artistId.toString();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this track?")) {
      try {
        await deleteMusic(song._id);
        if (onDelete) onDelete(song._id);
      } catch (error) {
        console.error("Failed to delete:", error);
        alert(error.response?.data?.message || "Failed to delete track");
      }
    }
  };

  if (viewMode === "list") {
    return (
      <div 
        onClick={() => {
          if (isCurrentSong) togglePlay();
          else playSong(song);
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
                else playSong(song);
              }}
              className="text-white"
            >
              {isCurrentlyPlaying ? <FiPause className="fill-white" /> : <FiPlay className="fill-white" />}
             </button>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <h3 className={`truncate text-sm font-semibold ${isCurrentSong ? "text-primary" : "text-white"}`}>{title}</h3>
          <p className="truncate text-xs text-text-secondary mt-0.5">{artist}</p>
        </div>
        {isOwner && (
          <button 
            onClick={handleDelete}
            className="flex items-center justify-center p-2 text-text-secondary hover:text-red-500 transition-colors ml-auto md:ml-0"
            title="Delete Track"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => {
        if (isCurrentSong) togglePlay();
        else playSong(song);
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
        
        {/* Play Button Overlay */}
        <div className={`absolute bottom-2 right-2 translate-y-4 transition-all duration-300 group-hover:translate-y-0 ${
          isCurrentSong ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100"
        }`}>
          <div className="flex flex-col gap-2 items-center">
            {isOwner && (
              <button 
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-105 hover:bg-red-500 active:scale-95"
                title="Delete Track"
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}
            <button 
              onClick={(e) => {
              e.stopPropagation();
              if (isCurrentSong) togglePlay();
              else playSong(song);
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
        <h3 className={`truncate text-base font-semibold ${isCurrentSong ? "text-primary" : "text-white"}`}>
          {title}
        </h3>
        <p className="truncate text-sm text-text-secondary mt-1">
          {artist}
        </p>
      </div>
    </div>
  );
};

export default MusicCard;
