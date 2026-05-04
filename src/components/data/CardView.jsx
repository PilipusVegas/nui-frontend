import React from "react";

const CardView = ({
  title,
  subtitle,
  badges = [],
  content,
  actions,
  expandable,
  className = "",
  headerRight = null,
}) => {
  return (
    <div
      className={`
        rounded-xl border border-slate-200 bg-white p-4 shadow-sm
        transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md
        ${className}
      `}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {subtitle}
            </p>
          )}

          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className={`
                    inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                    bg-slate-100 text-slate-700
                    ${badge.className || ""}
                  `}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {headerRight && (
          <div className="flex shrink-0 items-center gap-2">
            {headerRight}
          </div>
        )}
      </div>

      {/* CONTENT */}
      {content && (
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {content}
        </div>
      )}

      {/* EXPANDABLE */}
      {expandable && (
        <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {expandable}
        </div>
      )}

      {/* ACTIONS */}
      {actions && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default CardView;