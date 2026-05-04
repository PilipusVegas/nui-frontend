import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VARIANT_STYLES = {
  default: {
    card: "border-green-200 hover:border-green-300",
    iconBg: "bg-green-100",
    iconText: "text-green-700",
    titleText: "text-green-500",
    valueText: "text-green-900",
    noteText: "text-green-600",
  },
  success: {
    card: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    titleText: "text-emerald-600",
    valueText: "text-emerald-900",
    noteText: "text-emerald-700",
  },
  danger: {
    card: "border-rose-200 hover:border-rose-300",
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    titleText: "text-rose-600",
    valueText: "text-rose-900",
    noteText: "text-rose-700",
  },
  warning: {
    card: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    titleText: "text-amber-600",
    valueText: "text-amber-900",
    noteText: "text-amber-700",
  },
  info: {
    card: "border-cyan-200 hover:border-cyan-300",
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-700",
    titleText: "text-cyan-600",
    valueText: "text-cyan-900",
    noteText: "text-cyan-700",
  },
};

const SummaryCards = ({ items = [], className = "", showNote = false }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const renderCard = (item, index, isMobile = false) => {
    const style = VARIANT_STYLES[item.variant] || VARIANT_STYLES.default;
    const isClickable = typeof item.onClick === "function";

    return (
      <div
        key={item.key ?? index}
        onClick={isClickable ? item.onClick : undefined}
        className={`
          rounded-lg border bg-white
          ${style.card}
          transition-all duration-200
          ${isClickable ? "cursor-pointer active:scale-[0.99]" : ""}
          ${isMobile ? "min-w-[156px] shrink-0 px-3 py-3 snap-start" : "px-4 py-3"}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`
                text-[10px] font-semibold uppercase tracking-[0.13em]
                ${style.titleText}
                ${!isMobile ? "mb-1" : ""}
              `}
            >
              {item.title}
            </p>

            <p
              className={`
                truncate font-semibold
                ${style.valueText}
                ${isMobile ? "mt-1 text-md leading-tight" : "text-md leading-tight"}
              `}
            >
              {item.value}
            </p>

            {showNote && item.note && (
              <p className={`mt-1 text-[10px] font-medium ${style.noteText}`}>
                {item.note}
              </p>
            )}
          </div>

          {item.icon && (
            <div
              className={`
                flex shrink-0 items-center justify-center rounded-lg
                ${style.iconBg} ${style.iconText}
                ${isMobile ? "h-8 w-8" : "h-10 w-10"}
              `}
            >
              <FontAwesomeIcon icon={item.icon} className={isMobile ? "text-sm" : ""}/>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: scroll horizontal */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-1 pr-1 snap-x snap-mandatory">
          {items.map((item, index) => renderCard(item, index, true))}
        </div>
      </div>

      {/* Desktop: max 3 per row */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        {items.map((item, index) => renderCard(item, index, false))}
      </div>
    </div>
  );
};

export default SummaryCards;