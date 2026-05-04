// src/components/common/Badge.jsx
import React from "react";

const variantMap = {
  success: {
    solid: "bg-emerald-500 text-white border-emerald-500",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
    outline: "bg-transparent text-emerald-700 border-emerald-300",
  },
  danger: {
    solid: "bg-red-600 text-white border-red-600",
    soft: "bg-red-50 text-red-700 border-red-200",
    outline: "bg-transparent text-red-700 border-red-300",
  },
  warning: {
    solid: "bg-amber-500 text-white border-amber-500",
    soft: "bg-amber-50 text-amber-700 border-amber-200",
    outline: "bg-transparent text-amber-700 border-amber-300",
  },
  info: {
    solid: "bg-blue-600 text-white border-blue-600",
    soft: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-transparent text-blue-700 border-blue-300",
  },
  neutral: {
    solid: "bg-slate-600 text-white border-slate-600",
    soft: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
  },
  purple: {
    solid: "bg-violet-600 text-white border-violet-600",
    soft: "bg-violet-50 text-violet-700 border-violet-200",
    outline: "bg-transparent text-violet-700 border-violet-300",
  },
};

const sizeMap = {
  xs: "px-2 py-0.5 text-[10px] leading-4",
  sm: "px-2.5 py-1 text-[11px] leading-4",
  md: "px-3 py-1.5 text-xs leading-5",
  lg: "px-3.5 py-2 text-sm leading-5",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Badge = ({
  children,
  variant = "neutral",
  tone = "soft", // solid | soft | outline
  size = "md",   // xs | sm | md | lg
  rounded = "full", // full | lg | md | sm
  dot = false,
  icon = null,
  uppercase = false,
  clickable = false,
  className = "",
  ...props
}) => {
  const variantStyles = variantMap[variant] || variantMap.neutral;
  const toneStyles = variantStyles[tone] || variantStyles.soft;
  const sizeStyles = sizeMap[size] || sizeMap.md;

  const roundedMap = {
    full: "rounded-full",
    lg: "rounded-lg",
    md: "rounded-md",
    sm: "rounded-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-semibold whitespace-nowrap select-none",
        "transition-all duration-200",
        roundedMap[rounded] || roundedMap.full,
        sizeStyles,
        toneStyles,
        uppercase && "uppercase tracking-wide",
        clickable && "cursor-pointer hover:opacity-90 active:scale-95",
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            tone === "solid" ? "bg-white/90" : `bg-current`
          )}
        />
      )}

      {icon && <span className="shrink-0">{icon}</span>}

      <span>{children}</span>
    </span>
  );
};

export default Badge;