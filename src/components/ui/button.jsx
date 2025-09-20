import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/* Variasi warna dasar */
const VARIANTS = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
};

/* Ukuran */
const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    loading = false,
    disabled = false,
    className = "",
    ...props
}) {
    const isDisabled = disabled || loading;

    // gabung kelas manual, tanpa clsx
    const base =
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 ";
    const classes =
        base +
        VARIANTS[variant] +
        " " +
        SIZES[size] +
        (isDisabled ? " opacity-50 cursor-not-allowed " : " ") +
        className;

    return (
        <button disabled={isDisabled} className={classes} {...props}>
            {icon && iconPosition === "left" && (
                <FontAwesomeIcon icon={icon} className="mr-2" />
            )}
            {loading ? "Memuat..." : children}
            {icon && iconPosition === "right" && (
                <FontAwesomeIcon icon={icon} className="ml-2" />
            )}
        </button>
    );
}
