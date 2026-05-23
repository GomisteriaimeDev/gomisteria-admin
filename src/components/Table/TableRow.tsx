import React from "react";
import "./Table.scss";

const TableRow = ({
  columns,
  row,
  rowId,

  onRowClick,

  enableSelection,
  selected,
  onToggleSelected,
}: any) => {
  const handleCellClick = () => {
    if (!onRowClick) return;
    onRowClick();
  };

  return (
    <div className="table-row">
      {enableSelection && (
        <div
          className="table-cell table-cell--select"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelected?.(e.target.checked);
            }}
          />
        </div>
      )}

      {row.cells.map((cell: any, index: number) => {
        const colWidth = columns[index]?.width || cell.width;
        return (
          <div
            key={index}
            className="table-cell table-cell--clickable"
            style={colWidth ? { flex: `0 0 ${colWidth}`, width: colWidth } : undefined}
            onClick={handleCellClick}
          >
            <span className="mobileInfo">{columns[index]?.title}: </span>
            <span className="tableText">{cell.content}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TableRow;
