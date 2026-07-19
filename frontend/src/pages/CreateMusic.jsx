import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMusic } from "../services/musicService";
import { FiUploadCloud, FiMusic } from "react-icons/fi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const CreateMusic = () => {
  const [musicData, setMusicData] = useState({
    title: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setMusicData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Auto-fill title if empty
      if (!musicData.title) {
        setMusicData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      alert("Please select an audio file.");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", musicData.title);
    formData.append("music", audioFile);

    try {
      setIsSubmitting(true);
      await createMusic(formData);
      alert("Music uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to upload music");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Upload Music</h1>
        <p className="mt-2 text-text-secondary">Add a new track to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Audio File Upload */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg sm:p-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full gap-6 text-center rounded-2xl border-2 border-dashed border-border bg-background p-10 transition-colors hover:border-primary/50">
            <FiMusic className="text-6xl text-primary/80" />
            
            {audioFile ? (
              <div className="w-full truncate text-lg font-bold text-white px-4">
                {audioFile.name}
              </div>
            ) : (
              <div className="text-text-secondary">
                <p className="font-semibold text-white text-lg">Select an audio file</p>
                <p className="text-sm mt-1">MP3, WAV, FLAC</p>
              </div>
            )}

            <label className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95 shadow-md hover:bg-primary-hover">
              <FiUploadCloud className="text-xl" />
              <span>{audioFile ? "Change File" : "Browse Files"}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} required={!audioFile} />
            </label>
          </div>
        </div>

        {/* Track Details Section */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <div className="grid gap-6">
            <Input
              label="Track Title"
              name="title"
              placeholder="e.g. Midnight City"
              value={musicData.title}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-16 py-4 text-lg font-bold disabled:opacity-50">
            {isSubmitting ? "Uploading..." : "Publish Track"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMusic;
