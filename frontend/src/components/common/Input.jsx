import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  icon: Icon,
  error = "",
  required = false,
  name,
  id,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="w-full">
      {/* Label */}
      <label
        htmlFor={id || name}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-300"
      >
        {label}
        {required && <span className="text-primary">*</span>}
      </label>

      {/* Input Container */}
      <div
        className={`
          flex items-center
          rounded-xl
          border
          bg-surface
          transition-all
          duration-300
          ${
            error
              ? "border-danger"
              : "border-border focus-within:border-primary"
          }
        `}
      >
        {/* Left Icon */}
        {Icon && (
          <div className="pl-4 text-xl text-gray-400">
            <Icon />
          </div>
        )}

        {/* Input */}
        <input
          id={id || name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            w-full
            bg-transparent
            px-4
            py-3
            text-white
            placeholder:text-gray-500
            outline-none
          "
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="pr-4 text-xl text-gray-400 transition hover:text-white"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;