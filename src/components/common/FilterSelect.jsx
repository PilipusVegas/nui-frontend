import React from "react";
import Select from "react-select";

const baseSelectStyles = {
  container: (base) => ({
    ...base,
    width: "100%",
  }),

  control: (base, state) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    minHeight: 34,
    height: 34,
    backgroundColor: "transparent",
    cursor: "pointer",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 2px",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: 13,
  }),

  singleValue: (base) => ({
    ...base,
    fontSize: 13,
    color: "#1e293b",
  }),

  placeholder: (base) => ({
    ...base,
    fontSize: 13,
    color: "#94a3b8",
  }),

  indicatorsContainer: (base) => ({
    ...base,
    height: 34,
  }),

  dropdownIndicator: (base) => ({
    ...base,
    padding: 4,
  }),

  clearIndicator: (base) => ({
    ...base,
    padding: 4,
  }),

  menu: (base) => ({
    ...base,
    zIndex: 50,
    fontSize: 13,
  }),

  option: (base, state) => ({
    ...base,
    fontSize: 13,
    padding: "6px 10px",
    backgroundColor: state.isFocused ? "#f1f5f9" : "white",
    color: "#0f172a",
    cursor: "pointer",
  }),
};

const FilterSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Pilih",
  className = "",
  isClearable = true,
}) => {
  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      {/* LABEL */}
      <span className="absolute -top-2 left-2 px-1 text-[10px] font-medium bg-white text-slate-800">
        {label}
      </span>

      {/* FIELD */}
      <div className="h-[36px] px-2 border border-slate-400 rounded-md bg-white focus-within:border-green-500 flex items-center transition">
        <Select
          styles={baseSelectStyles}
          options={options}
          value={options.find((o) => o.value === value) || null}
          onChange={(opt) => onChange(opt?.value || "")}
          placeholder={placeholder}
          isClearable={isClearable}
        />
      </div>
    </div>
  );
};

export default FilterSelect;