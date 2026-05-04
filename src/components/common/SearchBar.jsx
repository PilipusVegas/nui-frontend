import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({
  onSearch,
  placeholder = "Cari...",
  className = "",
  inputClassName = "",
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <div
      className={`
        relative
        w-full sm:w-auto
        sm:min-w-[220px] sm:max-w-[320px]
        ${className}
      `}
    >
      {/* ICON */}
      <FontAwesomeIcon
        icon={faSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs"
      />

      {/* INPUT */}
      <input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
    w-full
    h-9
    pl-8 pr-8
    border
    bg-white
    text-sm text-slate-700
    placeholder:text-slate-400
    transition-all duration-200

    focus:outline-none
    focus:ring-1

    ${inputClassName || "rounded-md border-slate-400 focus:border-green-400 focus:ring-green-200"}
  `}
      />

      {/* CLEAR */}
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            absolute right-2.5 top-1/2 -translate-y-1/2
            text-slate-400 hover:text-slate-600
            transition text-xs
          "
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
}
