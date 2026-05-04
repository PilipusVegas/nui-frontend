import React from "react";

const DateRangeField = ({
  label = "Rentang Tanggal",
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  className = "",
}) => {
  return (
    <div
      className={`
        relative
        w-full sm:w-auto
        sm:min-w-[260px] sm:max-w-[340px]
        ${className}
      `}
    >
      {/* LABEL */}
      <span className="absolute -top-2 left-2 px-1 text-[10px] font-medium bg-white text-slate-800">
        {label}
      </span>

      {/* FIELD */}
      <div className="h-[36px] border border-slate-400 rounded-md bg-white focus-within:border-green-500 flex items-center overflow-hidden transition">

        {/* START */}
        <input
          type="date"
          className="text-[13px] outline-none bg-transparent px-2 flex-1 min-w-0"
          value={startDate || ""}
          onChange={(e) => onChangeStart(e.target.value)}
        />

        {/* DIVIDER */}
        <div className="h-[60%] w-px bg-slate-300 shrink-0" />

        {/* SEPARATOR */}
        <span className="px-2 text-slate-400 text-xs whitespace-nowrap shrink-0">
          s/d
        </span>

        {/* DIVIDER */}
        <div className="h-[60%] w-px bg-slate-300 shrink-0" />

        {/* END */}
        <input
          type="date"
          className="text-[13px] outline-none bg-transparent px-2 flex-1 min-w-0"
          value={endDate || ""}
          onChange={(e) => onChangeEnd(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateRangeField;