import React, { useCallback } from "react";
import classNames from "classnames";

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
  getCellClassName?: (
    columnKey: string,
    value: any,
    row: T,
    index: number
  ) => string;
}

export const Table = <T,>({
  columns,
  data,
  className,
  emptyMessage = "No data available...",
  onRowClick,
  getCellClassName,
}: TableProps<T>) => {
  const handleRowClick = useCallback(
    (row: T, index: number) => onRowClick?.(row, index),
    [onRowClick]
  );

  const getCellClasses = useCallback(
    (column: TableColumn<T>, cellValue: any, row: T, rowIndex: number) => {
      const base = "py-3 text-wrap";
      const clickable = column.isClickable
        ? "text-table-text-clickable cursor-pointer"
        : "";
      const custom = getCellClassName?.(
        String(column.key),
        cellValue,
        row,
        rowIndex
      );
      const defaultText =
        !column.isClickable && !custom ? "text-secondary-text" : "";

      return classNames(base, clickable, custom, defaultText);
    },
    [getCellClassName]
  );

  return (
    <div className={classNames("rounded", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map(({ key, header }) => (
              <th key={String(key)} className="text-primary-text p-2 border-b border-primary-border bg-primary-bg sticky top-0 z-10">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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
                className={classNames(
                  "text-center border-b border-primary-border",
                  {
                    "cursor-pointer hover:bg-opacity-grey transition-colors duration-200":
                      !!onRowClick,
                  }
                )}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {columns.map((column) => {
                  const cellValue = (row as any)[column.key];
                  return (
                    <td
                      key={String(column.key)}
                      className={getCellClasses(
                        column,
                        cellValue,
                        row,
                        rowIndex
                      )}
                    >
                      {column.render
                        ? column.render(cellValue, row, rowIndex)
                        : cellValue}
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