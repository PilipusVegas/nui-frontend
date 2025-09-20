// src/components/common/SearchBar.jsx
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({ onSearch, placeholder = "Cari data..." }) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        // opsional: debounce di sini
        onSearch?.(val);
    };

    const clearSearch = () => {
        setQuery("");
        onSearch?.("");
    };

    return (
        <div className="relative w-full max-w-md">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={handleChange} placeholder={placeholder} className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 transition" />
            {query && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
        </div>
    );
}
