import MusicCard from "../components/music/MusicCard";
import { useEffect, useState } from "react";
import { getAllMusic } from "../services/musicService";
import { FiGrid, FiList, FiMusic } from "react-icons/fi";

const Home = () => {
  const [viewMode, setViewMode] = useState("grid");

  const [musics, setMusics] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMusic = async () => {
    try {
      const data = await getAllMusic();

      setMusics(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load music. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackDelete = (deletedId) => {
    setMusics((prev) => prev.filter(song => song._id !== deletedId));
  };

  useEffect(() => {
    fetchMusic();
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <h1 className="text-white text-2xl animate-pulse">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
        <button 
          onClick={fetchMusic}
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
        <h1 className="text-3xl font-bold text-white">All Music</h1>
        <div className="flex md:hidden items-center gap-1 bg-surface p-1 rounded-lg border border-border">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-surface-hover text-white" : "text-text-secondary"}`}
          >
            <FiGrid />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-surface-hover text-white" : "text-text-secondary"}`}
          >
            <FiList />
          </button>
        </div>
      </div>

      {musics.length === 0 ? (
        <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-4 text-center mt-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-hover mb-2">
            <FiMusic className="text-5xl text-text-secondary/50" />
          </div>
          <h2 className="text-2xl font-bold text-white">No tracks found</h2>
          <p className="text-text-secondary max-w-sm">
            It looks like no music has been uploaded yet. Check back later or ask an artist to upload some tracks!
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
          : "flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }>
          {musics.map((song) => (
            <MusicCard key={song._id} song={song} viewMode={viewMode} onDelete={handleTrackDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
