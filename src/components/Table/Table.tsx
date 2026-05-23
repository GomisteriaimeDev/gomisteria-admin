import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Table.scss";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

type Column = {
  title: React.ReactNode;
  width?: number | string;
  searchable?: boolean;
};

type Cell = {
  content: any;
  width?: number | string;
  searchText?: string;
};

export type TableRowModel = {
  id?: string | number;
  cells: Cell[];
  onClick?: () => void;
  business?: any;
};

type SearchPayload = {
  global?: string;
  byColumn?: Record<number, string>;
};

const defaultGetRowId = (row: TableRowModel, index: number) => row.id ?? index;
const normalize = (v: any) => (v ?? "").toString().toLowerCase().trim();

type Props = {
  columns: Column[];
  rows: TableRowModel[];

  // UX defaults: checkboxes + search everywhere
  enableSelection?: boolean;
  enableColumnSearch?: boolean;
  enableGlobalSearch?: boolean;

  // Selection control (caller owns actions; table just exposes selection)
  selectedRowIds?: Array<string | number>;
  onSelectedRowIdsChange?: (payload: {
    selectedRowIds: Array<string | number>;
    selectedRows: TableRowModel[];
  }) => void;

  // Search control (optional)
  globalSearch?: string;
  onGlobalSearchChange?: (value: string) => void;

  searchByCol?: Record<number, string>;
  onColumnSearchChange?: (colIndex: number, value: string) => void;

  // Optional: lets pages do server-side search if needed
  onSearchChange?: (payload: SearchPayload) => void;

  // When true, skip local filtering (data is already filtered by the server)
  serverSideSearch?: boolean;

  getRowId?: (row: TableRowModel, index: number) => any;
};

const Table = ({
  columns,
  rows,

  enableSelection = true,
  enableColumnSearch = true,
  enableGlobalSearch = true,

  selectedRowIds,
  onSelectedRowIdsChange,

  globalSearch: globalSearchProp,
  onGlobalSearchChange: onGlobalSearchChangeProp,

  searchByCol: searchByColProp,
  onColumnSearchChange: onColumnSearchChangeProp,

  onSearchChange,

  serverSideSearch = false,

  getRowId = defaultGetRowId,
}: Props) => {
  // ----- Selection (controlled or uncontrolled) -----
  const isSelectionControlled = Array.isArray(selectedRowIds);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<any>>(
    new Set()
  );

  const selectedIds = useMemo(() => {
    return isSelectionControlled
      ? new Set(selectedRowIds)
      : internalSelectedIds;
  }, [isSelectionControlled, selectedRowIds, internalSelectedIds]);

  const setSelectedIds = (next: Set<any>) => {
    if (isSelectionControlled) {
      const nextIds = Array.from(next);
      const selectedRows = (rows || []).filter((r, i) =>
        next.has(getRowId(r, i))
      );
      onSelectedRowIdsChange?.({ selectedRowIds: nextIds, selectedRows });
    } else {
      setInternalSelectedIds(next);
    }
  };

  // Emit selection changes for uncontrolled mode as well (so callers can still react)
  useEffect(() => {
    if (!onSelectedRowIdsChange) return;
    if (isSelectionControlled) return;

    const nextIds = Array.from(internalSelectedIds);
    const selectedRows = (rows || []).filter((r, i) =>
      internalSelectedIds.has(getRowId(r, i))
    );
    onSelectedRowIdsChange({ selectedRowIds: nextIds, selectedRows });
  }, [internalSelectedIds, rows, getRowId, onSelectedRowIdsChange, isSelectionControlled]);

  // ----- Search (controlled or uncontrolled) -----
  const isGlobalSearchControlled = typeof globalSearchProp === "string";
  const isColumnSearchControlled = !!searchByColProp;

  const [internalGlobalSearch, setInternalGlobalSearch] = useState("");
  const [internalSearchByCol, setInternalSearchByCol] = useState<Record<number, string>>(
    {}
  );

  const globalSearch = isGlobalSearchControlled ? globalSearchProp! : internalGlobalSearch;
  const searchByCol = isColumnSearchControlled ? (searchByColProp as any) : internalSearchByCol;

  const hasMountedRef = useRef(false);

  const handleGlobalSearchChange = (value: string) => {
    onGlobalSearchChangeProp?.(value);
    if (!isGlobalSearchControlled) setInternalGlobalSearch(value);
  };

  const handleColumnSearchChange = (colIndex: number, value: string) => {
    onColumnSearchChangeProp?.(colIndex, value);
    if (!isColumnSearchControlled) {
      setInternalSearchByCol((prev) => ({ ...prev, [colIndex]: value }));
    }
  };

  // Optional: emit search intent upward (server-side, etc.)
  useEffect(() => {
    if (!onSearchChange) return;

    // avoid emitting on mount
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const byColumn: Record<number, string> = {};
    Object.entries(searchByCol || {}).forEach(([k, v]) => {
      const t = (v ?? "").toString();
      if (t.trim().length > 0) byColumn[Number(k)] = t;
    });

    const global = globalSearch?.trim();

    onSearchChange({
      global: global ? global : undefined,
      byColumn: Object.keys(byColumn).length ? byColumn : undefined,
    });
  }, [searchByCol, globalSearch, onSearchChange]);

  // ----- Filtering (local) -----
  const filteredRows = useMemo(() => {
    // When server-side search is enabled, skip local filtering
    if (serverSideSearch) {
      return (rows || []).map((row: any, idx: number) => ({ row, idx }));
    }

    const g = normalize(globalSearch);
    const by = searchByCol || {};

    return (rows || [])
      .map((row: any, idx: number) => ({ row, idx }))
      .filter(({ row }: any) => {
        // global search: match if any cell matches
        if (g) {
          const hit = (row.cells || []).some((c: Cell) => {
            const hay = normalize(c.searchText ?? c.content);
            return hay.includes(g);
          });
          if (!hit) return false;
        }

        // per-column search
        for (const [idxStr, needleRaw] of Object.entries(by)) {
          const colIdx = Number(idxStr);
          const needle = normalize(needleRaw);
          if (!needle) continue;

          const cell = row.cells?.[colIdx];
          const hay = normalize(cell?.searchText ?? cell?.content);
          if (!hay.includes(needle)) return false;
        }

        return true;
      });
  }, [rows, globalSearch, searchByCol, serverSideSearch]);

  // Visible row ids (for select-all on currently rendered set)
  const visibleRowIds = useMemo(() => {
    return (filteredRows || []).map(({ row, idx }: any) => getRowId(row, idx));
  }, [filteredRows, getRowId]);

  const allSelected = useMemo(() => {
    if (!enableSelection || visibleRowIds.length === 0) return false;
    return visibleRowIds.every((id: any) => selectedIds.has(id));
  }, [enableSelection, visibleRowIds, selectedIds]);

  const someSelected = useMemo(() => {
    if (!enableSelection || visibleRowIds.length === 0) return false;
    return visibleRowIds.some((id: any) => selectedIds.has(id));
  }, [enableSelection, visibleRowIds, selectedIds]);

  const toggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) visibleRowIds.forEach((id: any) => next.add(id));
    else visibleRowIds.forEach((id: any) => next.delete(id));
    setSelectedIds(next);
  };

  const toggleRowSelected = (rowId: any, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(rowId);
    else next.delete(rowId);
    setSelectedIds(next);
  };

  return (
    <div className="table-container">
      <TableHeader
        columns={columns}
        enableSelection={enableSelection}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleSelectAll={toggleSelectAll}
        enableColumnSearch={enableColumnSearch}
        searchByCol={searchByCol}
        onColumnSearchChange={handleColumnSearchChange}
        enableGlobalSearch={enableGlobalSearch}
        globalSearch={globalSearch}
        onGlobalSearchChange={handleGlobalSearchChange}
      />

      <div className="table-body">
        {filteredRows && filteredRows.length > 0 ? (
          filteredRows.map(({ row, idx }: any) => {
            const rowId = getRowId(row, idx);
            const isSelected = enableSelection ? selectedIds.has(rowId) : false;

            return (
              <div className="table-row-wrapper" key={rowId}>
                <TableRow
                  columns={columns}
                  row={row}
                  rowId={rowId}
                  enableSelection={enableSelection}
                  selected={isSelected}
                  onToggleSelected={(checked: boolean) =>
                    toggleRowSelected(rowId, checked)
                  }
                  onRowClick={row.onClick}
                />
              </div>
            );
          })
        ) : (
          <div className="no-results">No results found!</div>
        )}
      </div>
    </div>
  );
};

export default Table;
