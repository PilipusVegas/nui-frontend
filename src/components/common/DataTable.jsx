import React from "react";

const DataTable = ({ columns, data, renderMobile, renderActions }) => {
    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block mb-20">
                <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
                    <table className="min-w-full text-sm">
                        <thead className="bg-green-500 text-white">
                            <tr>
                                {columns.map((col, i) => (
                                    <th key={i} className={`px-4 py-3 ${col.align || "text-left"}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    {columns.map((col, j) => (
                                        <td key={j} className={`px-4 py-1.5 align-middle ${col.align || "text-left"}`}>
                                            {col.render(row, i)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {data.map((row, i) => renderMobile(row, i))}
            </div>
        </>
    );
};

export default DataTable;
