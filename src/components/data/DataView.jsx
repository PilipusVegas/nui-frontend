import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "../common/SearchBar";
import Pagination from "./Pagination";
import TableView from "./TableView";
import CardView from "./CardView";
import SummaryCards from "../common/SummaryCards";

import Loading from "../feedback/Loading";
import Error from "../feedback/Error";
import Empty from "../feedback/Empty";

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const renderCellValue = (col, row, index, meta) => {
  if (typeof col.render === "function") {
    return col.render(row, index, meta);
  }

  if (col.key) {
    return row?.[col.key] ?? "-";
  }

  return "-";
};

const DataView = ({
  data = [],
  columns = [],
  renderExpandedRow,
  rowKey = (row, index) => row?.id ?? row?.uuid ?? index,

  searchable = false,
  searchKeys = [],
  searchFn,
  searchPlaceholder = "Cari data...",

  itemsPerPage = 10,
  initialPage = 1,
  showPagination = true,

  isLoading = false,
  error = null,
  onRetry,

  loadingMessage,
  errorMessage,
  errorDetail,
  emptyTitle,
  emptyMessage,
  emptyActionText,
  onEmptyAction,

  className = "",
  toolbarClassName = "",
  tableClassName = "",
  mobileClassName = "",
  paginationClassName = "",
  useUrlPagination = false,

  header = null,
  actions = null,

  summaryItems = [],
  summaryClassName = "",

  renderMobile,
  showIndex = true,
  getRowClassName,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const normalizedSearch = search.trim().toLowerCase();
  const isSearching = searchable && normalizedSearch.length > 0;

  const filteredData = useMemo(() => {
    if (!searchable || !normalizedSearch) return data;

    if (typeof searchFn === "function") {
      return data.filter((item) => searchFn(item, normalizedSearch));
    }

    if (!searchKeys.length) return data;

    return data.filter((item) =>
      searchKeys.some((key) =>
        String(getNestedValue(item, key) ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [data, normalizedSearch, searchable, searchFn, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const topBarVisible = header || actions || searchable;

  const buildAutoMobileCard = (row, rowIndex, meta) => {
    const visibleColumns = columns.filter((col) => !col.hideOnMobile);
    const actionColumns = visibleColumns.filter((col) => col.isAction);
    const dataColumns = visibleColumns.filter((col) => !col.isAction);
    const primaryColumn = dataColumns[0];
    const secondaryColumn = dataColumns[1];
    const title = primaryColumn
      ? renderCellValue(primaryColumn, row, rowIndex, meta)
      : `Data ${meta.globalIndex}`;

    const subtitle = secondaryColumn
      ? renderCellValue(secondaryColumn, row, rowIndex, meta)
      : null;

    const contentColumns = dataColumns.slice(2);

    const actionsFromColumns = actionColumns.map((col, colIndex) => (
      <React.Fragment key={col.key ?? colIndex}>
        {renderCellValue(col, row, rowIndex, meta)}
      </React.Fragment>
    ));

    return (
      <CardView
        index={meta.globalIndex}
        title={title}
        subtitle={subtitle}
        className={mobileClassName}
        content={
          <div className="space-y-2.5">
            {contentColumns.map((col, colIndex) => (
              <div
                key={col.key ?? colIndex}
                className="flex items-start justify-between gap-4"
              >
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {col.label}
                </div>
                <div
                  className={`max-w-[60%] text-right text-sm text-slate-800 ${col.mobileCellClassName || ""}`}
                >
                  {renderCellValue(col, row, rowIndex, meta)}
                </div>
              </div>
            ))}
          </div>
        }
        actions={actionsFromColumns.length > 0 ? actionsFromColumns : null}
        expandable={
          typeof renderExpandedRow === "function"
            ? renderExpandedRow(row, rowIndex, meta)
            : null
        }
      />
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.isArray(summaryItems) && summaryItems.length > 0 && (
        <SummaryCards items={summaryItems} className={summaryClassName} />
      )}

      {topBarVisible && (
        <div
          className={`
      flex flex-col gap-2 mb-4
      md:flex-row md:items-center md:justify-between
      ${toolbarClassName}
    `}
        >
          {/* LEFT */}
          <div className="hidden md:block" />

          {/* RIGHT */}
          <div
            className="
              flex flex-col gap-4 w-full
              md:w-auto md:flex-row md:items-center md:justify-end md:gap-2
              min-w-0
            "
          >
            {/* FILTER */}
            {header && (
              <div className="flex flex-wrap gap-4 md:gap-2 min-w-0">
                {header}
              </div>
            )}

            {/* SEARCH */}
            {searchable && (
              <div className="w-full md:w-56 min-w-0">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}

            {/* ACTION */}
            {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      {isLoading ? (
        <Loading message={loadingMessage} />
      ) : error ? (
        <Error
          message={errorMessage}
          detail={errorDetail || error}
          onRetry={onRetry}
        />
      ) : filteredData.length === 0 ? (
        <Empty
          title={isSearching ? "Data tidak ditemukan" : emptyTitle}
          description={
            isSearching
              ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
              : emptyMessage
          }
          actionText={!isSearching ? emptyActionText : undefined}
          onAction={!isSearching ? onEmptyAction : undefined}
        />
      ) : (
        <>
          <TableView
            showIndex={showIndex}
            columns={columns}
            data={paginatedData}
            renderExpandedRow={renderExpandedRow}
            rowKey={rowKey}
            startIndex={startIndex}
            tableClassName={tableClassName}
            rowClassName={getRowClassName} // ✅ TAMBAH INI
          />

          <div className="space-y-3 md:hidden">
            {paginatedData.map((row, rowIndex) => {
              const key = rowKey(row, rowIndex);
              const meta = {
                index: rowIndex,
                globalIndex: startIndex + rowIndex + 1,
                startIndex,
              };

              return (
                <React.Fragment key={key}>
                  {typeof renderMobile === "function"
                    ? renderMobile(row, rowIndex, meta)
                    : buildAutoMobileCard(row, rowIndex, meta)}
                </React.Fragment>
              );
            })}
          </div>

          {showPagination && filteredData.length > itemsPerPage && (
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              className={paginationClassName}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataView;
