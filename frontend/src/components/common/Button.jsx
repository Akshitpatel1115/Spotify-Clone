const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        py-3
        rounded-full
        bg-primary
        text-white
        font-semibold
        text-base
        transition-all
        duration-300
        hover:bg-primary-hover
        hover:scale-[1.02]
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;