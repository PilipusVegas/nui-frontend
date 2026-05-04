import React from "react";

/* ================= ROOT ================= */
const DetailCard = ({ children, className = "" }) => {
  return (
    <div className={`border rounded-xl bg-white overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

/* ================= HEADER ================= */
const Header = ({ title, note, right }) => {
  return (
    <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        )}
        {note && <p className="text-sm text-gray-500">{note}</p>}
      </div>

      {right && <div className="flex items-center">{right}</div>}
    </div>
  );
};

/* ================= BODY ================= */
const Body = ({ children }) => {
  return <div className="p-4 space-y-4">{children}</div>;
};

/* ================= SECTION ================= */
const Section = ({ title, children }) => {
  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-700">
          {title}
        </h4>
      )}
      {children}
      <Divider />
    </div>
  );
};

/* ================= GRID ================= */
const Grid = ({ children, cols = "sm:grid-cols-2" }) => {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-4`}>
      {children}
    </div>
  );
};

/* ================= ITEM ================= */
const Item = ({ label, value, highlight }) => {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`font-semibold ${
          highlight ? "text-green-600" : "text-gray-800"
        }`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
};

/* ================= ACTIONS ================= */
const Actions = ({ children }) => {
  return (
    <div className="border-t px-4 py-3 flex justify-end gap-3">
      {children}
    </div>
  );
};

/* ================= DIVIDER ================= */
const Divider = () => (
  <div className="border-t border-dashed border-gray-200" />
);

/* ================= EXPORT ================= */
DetailCard.Header = Header;
DetailCard.Body = Body;
DetailCard.Section = Section;
DetailCard.Grid = Grid;
DetailCard.Item = Item;
DetailCard.Actions = Actions;

export default DetailCard;