import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VARIANTS = {
  primary: "bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white shadow-sm",
  success: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-300 text-white shadow-sm",
  warning: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 text-white shadow-sm",
  danger: "bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white shadow-sm",
  detail: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 text-white shadow-sm",
  info: "bg-sky-500 hover:bg-sky-600 focus:ring-sky-300 text-white shadow-sm",
  sync: "bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-300 text-white shadow-sm",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300 border border-slate-200",
  fullscreen: "bg-slate-700 hover:bg-slate-800 focus:ring-slate-400 text-white shadow-sm",
  outline: "bg-white hover:bg-green-50 text-green-600 border border-green-500 focus:ring-green-300",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm sm:text-base",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = "rounded-xl",
  className = "",
  type = "button",
  ...props
}) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 " +
    "select-none whitespace-nowrap";

  const widthClass = fullWidth ? "w-full" : "w-auto";
  const iconSizeClass = "text-sm sm:text-base";

  const classes =
    base +
    " " +
    widthClass +
    " " +
    rounded +
    " " +
    SIZES[size] +
    " " +
    (VARIANTS[variant] || VARIANTS.primary) +
    " " +
    className;

  return (
    <button type={type} disabled={isDisabled} className={classes} {...props}>
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Memuat...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <FontAwesomeIcon icon={icon} className={iconSizeClass} />
          )}

          {children && <span>{children}</span>}

          {icon && iconPosition === "right" && (
            <FontAwesomeIcon icon={icon} className={iconSizeClass} />
          )}
        </>
      )}
    </button>
  );
}