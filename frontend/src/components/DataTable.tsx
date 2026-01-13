// components/DataTable/data-table.tsx

// components/DataTable/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Popover, PopoverContent } from "./ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "./ui/calendar";
import { useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { Columns, Columns as ColumnWithType } from "@/types/types";

export interface DataTableProps<TData> {
  columns: Columns<TData>[];
  data: TData[];
  children?: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  isLoading?: boolean;
  onFilterChange?: (filters: {
    pesquisa?: string;
    data?: string;
    page?: number;
    ordenacao?: string;
    ordem?: "asc" | "desc";
  }) => void;
  getRowClassName?: (row: TData) => string;
  onRowSelect?: (row: TData | null) => void;
}

export function DataTable<TData>({
  columns,
  data,
  children,
  totalPages = 1,
  currentPage = 0,
  isLoading = false,
  onFilterChange,
  getRowClassName,
  onRowSelect,
}: DataTableProps<TData>) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [pageIndex, setPageIndex] = useState(currentPage);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    return columns.map((col) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (col.cell) return col as ColumnDef<TData, any>;
      if (col.type === "badge") {
        return {
          ...col,
          cell: ({ getValue }) => (
            <Badge variant={col.variant ?? "secondary"}>
              {String(getValue() ?? "")}
            </Badge>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as ColumnDef<TData, any>;
      }

      if (col.type === "action") {
      }

      if (col.type === "conjunto") {
        return {
          ...col,
          cell: ({ getValue }) => {
            const v = getValue() as unknown as
              | Record<string, unknown>
              | null
              | undefined;
            if (!v || typeof v !== "object") {
              return <span>{String(v ?? "")}</span>;
            }
            const values = Object.values(v);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const top =
              (v as any).top ??
              (v as any).primary ??
              (v as any).label ??
              values[1] ??
              "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bottom =
              (v as any).bottom ??
              (v as any).secondary ??
              (v as any).subLabel ??
              values[2] ??
              "";
            return (
              <div className="flex flex-col">
                <span className="font-medium leading-tight">
                  {String(top ?? "")}
                </span>
                <span className="text-muted-foreground text-xs leading-tight">
                  {String(bottom ?? "")}
                </span>
              </div>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as ColumnDef<TData, any>;
      }

      return {
        ...col,
        cell: ({ getValue }) => <span>{String(getValue() ?? "")}</span>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as ColumnDef<TData, any>;
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: normalizedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex, pageSize: 10 },
    },
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      onFilterChange?.({
        pesquisa: value,
        data: selectedDate?.toISOString(),
        page: 0,
      });
      setPageIndex(0);
    },
    [selectedDate, onFilterChange]
  );

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      onFilterChange?.({
        pesquisa: searchValue,
        data: date?.toISOString(),
        page: 0,
      });
      setPageIndex(0);
    },
    [searchValue, onFilterChange]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const ordeblaColumn = columns.find((col) => col.isOrderable && sortOrder);

      setPageIndex(newPage);
      onFilterChange?.({
        pesquisa: searchValue,
        data: selectedDate?.toISOString(),
        page: newPage,
        ordenacao: sortOrder ? ordeblaColumn?.accessorKey : undefined,
        ordem: sortOrder ?? undefined,
      });
    },
    [searchValue, selectedDate, sortOrder, onFilterChange, columns]
  );

  const handleSortChange = useCallback(() => {
    const newOrder =
      sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc";

    const ordeblaColumn = columns.find((col) => col.isOrderable && sortOrder);

    setSortOrder(newOrder);
    setPageIndex(0);
    onFilterChange?.({
      pesquisa: searchValue,
      data: selectedDate?.toISOString(),
      page: 0,
      ordenacao: sortOrder ? ordeblaColumn?.accessorKey : undefined,

      ordem: newOrder ?? undefined,
    });
  }, [sortOrder, searchValue, selectedDate, onFilterChange, columns]);

  return (
    <>
      <div className="border rounded-md bg-white mt-10 mx-10 p-6 h-full">
        <div className="flex flex-wrap items-center">
          {/* 🔍 Search */}
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nome"
              className="pl-9 w-100"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 📅 Filtro por data */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 border ml-4 w-30"
                disabled={isLoading}
              >
                <CalendarIcon className="h-4 w-4" />
                {selectedDate
                  ? selectedDate.toLocaleDateString("pt-BR")
                  : "Selecione"}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="p-0 ">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>

          {/* ➕ Botão */}
          <div className="ml-auto gap-2">{children}</div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : table.getRowModel().rows.length ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => {
                    const columnDef = header.column
                      .columnDef as ColumnWithType<TData>;

                    return (
                      <TableHead key={header.id}>
                        {columnDef.isOrderable ? (
                          <button
                            onClick={handleSortChange}
                            className="flex items-center gap-2 hover:text-foreground transition-colors"
                            disabled={isLoading}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sortOrder && (
                              <span className="text-xs">
                                {sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`${getRowClassName?.(row.original) ?? ""} ${
                    selectedRowId === row.id
                      ? "bg-blue-50 dark:bg-blue-950"
                      : ""
                  } ${
                    onRowSelect
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                      : ""
                  }`}
                  onClick={() => {
                    if (onRowSelect) {
                      const newSelectedId =
                        selectedRowId === row.id ? null : row.id;
                      setSelectedRowId(newSelectedId);
                      onRowSelect(newSelectedId ? row.original : null);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col h-full items-center justify-center py-10 ">
            <Image src="/Empty.svg" alt="logo" width={200} height={200} />
            <p className="font-semibold text-xl">Nada por aqui ainda...</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 my-5">
        {/* Anterior */}
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 rounded-md border"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex === 0 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Página atual */}
        <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white">
          {pageIndex + 1} / {totalPages}
        </span>

        {/* Próxima */}
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 rounded-md border"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1 || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
