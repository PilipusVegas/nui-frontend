import React from "react";

const renderValue = (col, row, index, meta) => {
  if (typeof col.render === "function") {
    return col.render(row, index, meta);
  }

  if (col.key) {
    return row?.[col.key] ?? "-";
  }

  return "-";
};

const TableView = ({
  columns = [],
  data = [],
  renderExpandedRow,
  rowKey = (row, index) => row?.id ?? row?.uuid ?? index,
  startIndex = 0,
  tableClassName = "",
  showIndex = true,
  rowClassName,
}) => {
  return (
    <div className="hidden md:block">
      <div
        className={`
          overflow-hidden rounded-lg border border-slate-200 bg-white
          shadow-sm
          ${tableClassName}
        `}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* HEADER */}
            <thead className="bg-green-500">
              <tr className="border-b border-slate-200">
                {showIndex && (
                  <th className="w-12 px-3 py-3 text-center text-sm font-bold text-white">
                    #
                  </th>
                )}

                {columns.map((col, i) => (
                  <th
                    key={col.key ?? i}
                    className={`
                      px-4 py-3 text-xs font-bold uppercase tracking-wide text-white
                      ${col.align || "text-left"}
                      ${col.headerClassName || ""}
                    `}
                    style={
                      col.width
                        ? { width: col.width, minWidth: col.width }
                        : undefined
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.map((row, rowIndex) => {
                const key = rowKey(row, rowIndex);
                const meta = {
                  index: rowIndex,
                  globalIndex: startIndex + rowIndex + 1,
                  startIndex,
                };

                const expandedContent =
                  typeof renderExpandedRow === "function"
                    ? renderExpandedRow(row, rowIndex, meta)
                    : null;

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={`
    border-b border-slate-300
    transition-colors
    ${rowClassName?.(row, rowIndex, meta) || "hover:bg-slate-200/80"}
  `}
                    >
                      {showIndex && (
                        <td className="px-3 py-1.5 text-center text-xs font-medium text-slate-700">
                          {meta.globalIndex}
                        </td>
                      )}

                      {columns.map((col, colIndex) => (
                        <td
                          key={col.key ?? colIndex}
                          className={`
                            px-4 py-1.5 text-slate-700 align-middle
                            ${col.align || "text-left"}
                            ${col.cellClassName || ""}
                          `}
                        >
                          <div className={col.truncate ? "truncate" : ""}>
                            {renderValue(col, row, rowIndex, meta)}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* EXPANDED */}
                    {expandedContent && (
                      <tr className="bg-slate-50/70">
                        <td
                          colSpan={columns.length + (showIndex ? 1 : 0)}
                          className="px-4 py-4"
                        >
                          {expandedContent}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableView;
