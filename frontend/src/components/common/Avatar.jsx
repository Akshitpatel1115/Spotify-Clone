import { FiUser } from "react-icons/fi";

const Avatar = ({ src, alt, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-2xl",
    xl: "h-24 w-24 text-4xl",
  };

  return (
    <div 
      className={`
        flex items-center justify-center shrink-0 rounded-full bg-surface overflow-hidden
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={alt || "Avatar"} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary">
          <FiUser />
        </div>
      )}
    </div>
  );
};

export default Avatar;
