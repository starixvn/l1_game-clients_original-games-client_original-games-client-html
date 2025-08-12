import React, { useCallback } from "react";

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  isClickable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
}

export const Table = <T,>({
  columns,
  data,
  className,
  emptyMessage = "No data available",
  onRowClick,
}: TableProps<T>) => {
  const handleRowClick = useCallback(
    (row: T, index: number) => {
      onRowClick?.(row, index);
    },
    [onRowClick]
  );

  return (
    <div className={`rounded bg-primary-bg p-2 ${className || ""}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map(({ key, header }) => (
              <th
                key={String(key)}
                className="text-primary-text p-2"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-secondary-bg">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-secondary-text py-8"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`text-center border-b border-primary-border ${
                  onRowClick
                    ? "cursor-pointer hover:bg-opacity-grey transition-colors duration-200"
                    : ""
                }`}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {columns.map(({ key, render, isClickable }) => {
                  const cellValue = (row as any)[key];
                  const clickableClasses = isClickable ? 'text-table-text-clickable cursor-pointer' : 'text-secondary-text';
                  return (
                    <td
                      key={String(key)}
                      className={`py-3 text-wrap ${clickableClasses}`}
                    >
                      {render ? render(cellValue, row, rowIndex) : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
