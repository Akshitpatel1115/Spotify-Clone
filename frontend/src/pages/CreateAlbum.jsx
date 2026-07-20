import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAlbum, getAllMusic, deleteMusic } from "../services/musicService";
import { FiMusic, FiCheck, FiLoader, FiTrash2 } from "react-icons/fi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../context/useAuth";

const CreateAlbum = () => {
  const { user } = useAuth();
  const [albumData, setAlbumData] = useState({
    title: "",
  });
  
  const [artistTracks, setArtistTracks] = useState([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistTracks = async () => {
      try {
        const allMusics = await getAllMusic();
        // Filter by current artist's ID
        const currentId = user?._id || user?.id;
        const myTracks = allMusics.filter(
          (track) => track.artist?._id === currentId || track.artist === currentId
        );
        setArtistTracks(myTracks);
      } catch (error) {
        console.error("Failed to load tracks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchArtistTracks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAlbumChange = (e) => {
    setAlbumData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleTrackSelection = (trackId) => {
    setSelectedTrackIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleTrackDelete = async (e, trackId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this track? This will remove it from all albums.")) {
      try {
        await deleteMusic(trackId);
        setArtistTracks(prev => prev.filter(t => t._id !== trackId));
        setSelectedTrackIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
      } catch (error) {
        console.error("Failed to delete track:", error);
        alert(error.response?.data?.message || "Failed to delete track");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!albumData.title || selectedTrackIds.size === 0) {
      alert("Please provide an album title and select at least one track.");
      return;
    }

    const payload = {
      title: albumData.title,
      musics: Array.from(selectedTrackIds)
    };
    
    try {
      setIsSubmitting(true);
      await createAlbum(payload);
      alert("Album created successfully!");
      navigate("/album");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create album");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Create New Album</h1>
        <p className="mt-2 text-text-secondary">Compile your uploaded tracks into a new album.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Album Details Section */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-white">Album Information</h2>
          <Input
            label="Album Title"
            name="title"
            placeholder="e.g. Hurry Up, We're Dreaming"
            value={albumData.title}
            onChange={handleAlbumChange}
            required
          />
        </div>

        {/* Tracks Selection Section */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Select Tracks</h2>
              <p className="text-sm text-text-secondary mt-1">Click to select tracks to include in this album.</p>
            </div>
            <div className="rounded-full bg-surface-hover px-4 py-2 text-sm font-bold text-white border border-border">
              {selectedTrackIds.size} Selected
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12">
              <FiLoader className="mb-4 text-4xl text-primary animate-spin" />
              <p className="text-text-secondary font-medium">Loading your tracks...</p>
            </div>
          ) : artistTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 transition-colors">
              <FiMusic className="mb-4 text-5xl text-text-secondary/50" />
              <p className="text-text-secondary font-medium">You haven't uploaded any tracks yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {artistTracks.map((track) => {
                const isSelected = selectedTrackIds.has(track._id);
                return (
                  <div 
                    key={track._id} 
                    onClick={() => toggleTrackSelection(track._id)}
                    className={`group flex items-center gap-4 rounded-xl p-3 pl-4 border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "bg-background border-border/50 hover:border-border hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected ? "bg-primary border-primary text-black" : "border-text-secondary bg-transparent group-hover:border-white"
                    }`}>
                      {isSelected && <FiCheck strokeWidth={3} />}
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <span className={`truncate font-medium transition-colors ${isSelected ? "text-primary" : "text-white"}`}>
                        {track.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleTrackDelete(e, track._id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-red-500/20 hover:text-red-500 transition-colors"
                      title="Delete Track"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-16 py-4 text-lg font-bold disabled:opacity-50">
            {isSubmitting ? "Publishing..." : "Publish Album"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlbum;

