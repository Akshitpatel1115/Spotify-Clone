import { Link } from "react-router-dom";
import { FiDisc } from "react-icons/fi";

const AlbumCard = ({ album = {} }) => {
  const id = album.id || "1";
  const title = album.title || "Hurry Up, We're Dreaming";
  const artist = album.artist || "M83";

  return (
    <Link 
      to={`/album/${id}`}
      className="group relative flex flex-col gap-3 rounded-2xl bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-surface-hover hover:shadow-lg hover:shadow-primary/5 cursor-pointer block border border-border/50 hover:border-border"
    >
      {/* Icon Placeholder */}
      <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-surface-hover to-background shadow-md">
        <FiDisc className="text-6xl text-text-secondary/50 group-hover:text-primary/50 transition-all duration-500 group-hover:scale-110" />
        
        {/* Subtle Overlay on hover to indicate clickability */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h3 className="truncate text-base font-semibold text-white group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="truncate text-sm text-text-secondary mt-1">
          {artist}
        </p>
      </div>
    </Link>
  );
};

export default AlbumCard;
