import React from "react";

const MobileDataCard = ({ title, subtitle, badges, content, actions, expandable,}) => {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-semibold text-gray-800">{title}</div>
                    {subtitle && (
                        <div className="text-xs text-gray-500">{subtitle}</div>
                    )}
                </div>

                {badges && (
                    <div className="flex flex-wrap gap-1">
                        {badges.map((badge, i) => (
                            <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded ${badge.className}`}
                            >
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="text-sm text-gray-700 space-y-1">
                {content}
            </div>

            {/* Expandable Content */}
            {expandable && (
                <div className="pt-2 border-t text-xs text-gray-600">
                    {expandable}
                </div>
            )}

            {/* Actions */}
            {actions && (
                <div className="flex justify-end gap-2 pt-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default MobileDataCard;
