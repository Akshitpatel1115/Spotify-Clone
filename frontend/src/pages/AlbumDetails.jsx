import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPlay, FiPause, FiDisc, FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { getAlbumById } from "../services/musicService";
import { usePlayer } from "../context/PlayerContext";

const AlbumDetails = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbumById(id);
        setAlbum(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load album details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <h1 className="text-white text-2xl font-semibold animate-pulse">Loading Album Details...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center pt-20 flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center pt-20">
        <h1 className="text-white text-xl">Album not found.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-8">
      {/* Header Section */}
      <div className="relative flex flex-col items-start gap-6 bg-gradient-to-b from-[#4a4a4a] to-[#121212] p-4 sm:flex-row sm:items-end sm:p-8 lg:p-10">
        
        {/* Album Icon Placeholder */}
        <div className="h-48 w-48 shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-surface-hover to-background shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64 border border-border">
          <FiDisc className="text-8xl text-text-secondary/50" />
        </div>

        {/* Album Info */}
        <div className="flex flex-col justify-end">
          <span className="hidden text-sm font-medium text-white sm:block uppercase tracking-wider">Album</span>
          <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl truncate tracking-tighter">
            {album.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
            <span className="font-bold hover:underline cursor-pointer">{album.artist?.username || "Unknown Artist"}</span>
            <span className="text-text-secondary">•</span>
            <span className="text-text-secondary">{album.musics?.length || 0} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <button 
          onClick={() => {
            if (album.musics?.length > 0) {
              const firstTrack = album.musics[0];
              playSong({
                ...firstTrack,
                artist: typeof firstTrack.artist === "string" ? album.artist : (firstTrack.artist || album.artist)
              });
            }
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black transition-transform hover:scale-105 active:scale-95 shadow-lg hover:bg-primary-hover"
        >
          <FiPlay className="ml-1 text-2xl fill-black" />
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="px-4 sm:px-8 lg:px-10">
        <div className="mb-4 grid grid-cols-[auto_1fr_auto] gap-4 border-b border-border/50 pb-2 text-sm font-medium text-text-secondary px-4">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="pr-4">Actions</div>
        </div>

        <div className="flex flex-col">
          {album.musics.map((track, index) => {
            const isCurrentTrack = currentSong?._id === track._id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            
            return (
              <div 
                key={track._id} 
                onClick={() => {
                  if (isCurrentTrack) togglePlay();
                  else {
                    playSong({
                      ...track,
                      artist: typeof track.artist === "string" ? album.artist : (track.artist || album.artist)
                    });
                  }
                }}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md px-4 py-3 transition-colors cursor-pointer ${
                  isCurrentTrack ? "bg-surface-hover/50" : "hover:bg-surface-hover"
                }`}
              >
                {/* Index / Play Icon */}
                <div className="w-8 text-center flex justify-center">
                  {isCurrentlyPlaying ? (
                    <FiPause className="text-primary fill-primary" />
                  ) : isCurrentTrack ? (
                    <FiPlay className="text-primary fill-primary" />
                  ) : (
                    <>
                      <span className="text-text-secondary group-hover:hidden">{index + 1}</span>
                      <FiPlay className="hidden text-white group-hover:block fill-white" />
                    </>
                  )}
                </div>
                
                {/* Title & Artist */}
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-base font-normal truncate ${isCurrentTrack ? "text-primary" : "text-white"}`}>
                    {track.title}
                  </span>
                  <span className="text-sm text-text-secondary hover:underline hover:text-white transition-colors truncate">
                    {track.artist?.username || album.artist?.username || "Unknown Artist"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-text-secondary pr-4">
                  <FiHeart className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100 hidden sm:block" />
                  <FiMoreHorizontal className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AlbumDetails;
