import React, { useEffect, useRef } from "react";
import "./Table.scss";

const TableHeader = ({
  columns,

  enableSelection,
  allSelected,
  someSelected,
  onToggleSelectAll,

  enableColumnSearch,
  searchByCol,
  onColumnSearchChange,

  enableGlobalSearch,
  globalSearch,
  onGlobalSearchChange,
}: any) => {
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !!someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  return (
    <div className="table-header-wrapper">
      {enableGlobalSearch && (
        <div className="table-global-search">
          <input
            className="global-search"
            type="text"
            value={globalSearch ?? ""}
            onChange={(e) => onGlobalSearchChange?.(e.target.value)}
            placeholder="Search..."
            aria-label="Search table"
          />
        </div>
      )}

      <div className="table-header">
        {enableSelection && (
          <div className="table-cell table-cell--select">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={!!allSelected}
              onChange={(e) => onToggleSelectAll?.(e.target.checked)}
              aria-label="Select all rows"
            />
          </div>
        )}

        {columns.map((col: any, index: number) => (
          <div key={index} className="table-cell" style={col.width ? { flex: `0 0 ${col.width}`, width: col.width } : undefined}>
            <div className="header-title">{col.title}</div>

            {enableColumnSearch && col.searchable !== false && (
              <input
                className="column-search"
                type="text"
                value={searchByCol?.[index] ?? ""}
                onChange={(e) => onColumnSearchChange?.(index, e.target.value)}
                placeholder="Search..."
                aria-label={`Search column ${index}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableHeader;
