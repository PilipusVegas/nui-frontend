import React, { useState, useMemo } from "react";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";

const DataView = ({
    data = [],
    columns,
    renderMobile,
    searchable = false,
    searchKeys = [],
    itemsPerPage = 10,
    className = "",
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!searchable || !search || searchKeys.length === 0) return data;

        return data.filter((item) =>
            searchKeys.some((key) =>
                String(item[key] ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );
    }, [data, search, searchable, searchKeys]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {searchable && (
                <SearchBar onSearch={handleSearch} placeholder="Cari data..." />
            )}

            <DataTable columns={ typeof columns === "function" ? columns({ currentPage, itemsPerPage }) : columns} data={paginatedData} renderMobile={renderMobile}/>

            {filteredData.length > itemsPerPage && (
                <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage}/>
            )}
        </div>
    );
};

export default DataView;
