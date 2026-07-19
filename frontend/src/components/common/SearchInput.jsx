import { FiSearch } from "react-icons/fi";

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative flex items-center group ${className}`}>
      <FiSearch className="absolute left-4 text-lg text-text-secondary group-focus-within:text-white transition-colors" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-transparent bg-surface py-3 pl-11 pr-4 text-sm text-white placeholder-text-secondary transition-all duration-300 focus:border-border focus:bg-surface-hover focus:outline-none hover:bg-surface-hover hover:border-border/50"
      />
    </div>
  );
};

export default SearchInput;
