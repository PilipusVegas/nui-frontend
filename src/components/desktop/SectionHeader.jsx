import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SectionHeader = ({ title, subtitle, onBack, actions }) => {
  return (
    <div className="w-full mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="
              flex h-8 w-8 shrink-0 aspect-square items-center justify-center
              rounded-md border border-green-200
              text-green-600 bg-white
              transition-all duration-200
              hover:bg-green-50 hover:border-green-400
              active:scale-95
            "
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </button>
        )}

        <div className="min-w-0 leading-tight">
          <h1 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full sm:w-auto min-w-0 relative">
        {/* Gradient kiri */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-white/70 to-transparent sm:hidden" />

        {/* Gradient kanan */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white/70 to-transparent sm:hidden" />

        <div
          className="
      flex gap-2
      overflow-x-auto
      scrollbar-none
      sm:overflow-visible
      pb-1 sm:pb-0
    "
        >
          {actions}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
