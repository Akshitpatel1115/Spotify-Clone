import { useEffect, useState } from "react";
import AlbumCard from "../components/album/AlbumCard";
import { getAllAlbums } from "../services/musicService";

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlbums = async () => {
    try {
      const data = await getAllAlbums();
      setAlbums(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load albums. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <h1 className="text-white text-2xl font-semibold animate-pulse">Loading Albums...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
        <button 
          onClick={fetchAlbums}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-black transition hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">All Albums</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {albums.map((album) => (
          <AlbumCard 
            key={album._id} 
            album={{ 
              id: album._id, 
              title: album.title, 
              artist: album.artist?.username || "Unknown Artist" 
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default Albums;
