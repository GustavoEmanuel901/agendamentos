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
import { useState, useCallback, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type {
  Columns,
  Columns as ColumnWithType,
  DataTableFilters,
} from "@/types/types";
import { useDebouncedCallback } from "use-debounce";
import { useOrder } from "@/contexts/orderContext";

export interface DataTableProps<TData> {
  columns: Columns<TData>[];
  data: TData[];
  children?: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  isLoading?: boolean;
  onFilterChange?: (filters: DataTableFilters) => void;
  getRowClassName?: (row: TData) => string;
  onRowSelect?: (row: TData | null) => void;
  placeholderInput?: string;
}

export default function DataTable<TData>({
  columns,
  data,
  children,
  totalPages = 1,
  currentPage = 0,
  isLoading = false,
  onFilterChange,
  getRowClassName,
  onRowSelect,
  placeholderInput,
}: DataTableProps<TData>) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [pageIndex, setPageIndex] = useState(currentPage);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const { setOrder, order } = useOrder();

  // Sincronizar pageIndex com currentPage vindo do pai
  useEffect(() => {
    setPageIndex(currentPage);
  }, [currentPage]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    return columns.map((col) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (col.cell) return col as ColumnDef<TData, any>;
      if (col.type === "badge") {
        return {
          ...col,
          cell: ({ getValue }) => (
            <Badge
              className={
                col.variant === "secondary"
                  ? "bg-(--background) px-2 py-1 border border-gray-300 text-gray-700"
                  : ""
              }
              variant={col.variant ?? "secondary"}
            >
              {String(getValue() ?? "")}
            </Badge>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as ColumnDef<TData, any>;
      }

      if (col.type === "object") {
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

            Object.keys(v).forEach((key) => {
              if (col.objectKeys && !col.objectKeys.includes(key))
                delete v[key];
            });

            const values = Object.values(v);

            const top = v.top ?? v.primary ?? v.label ?? values[0] ?? "";
            const bottom =
              v.bottom ?? v.secondary ?? v.subLabel ?? values[1] ?? "";
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

  const debouncedFilter = useDebouncedCallback((value: string) => {
    // const orderableColumn = columns.find(
    //   (col) => col.isOrderable && order?.sort
    // );
    onFilterChange?.({
      search: value,
      filterDate: selectedDate?.toISOString(),
      page: 1, // API espera páginas baseadas em 1
      order: order?.order ?? undefined,
      sort: order?.sort ?? undefined,
    });
  }, 1000);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      debouncedFilter(value);
      setPageIndex(0);
    },
    [debouncedFilter]
  );

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      const orderableColumn = columns.find(
        (col) => col.isOrderable && order?.sort
      );
      setSelectedDate(date);
      onFilterChange?.({
        search: searchValue,
        filterDate: date?.toISOString(),
        page: 1, // API espera páginas baseadas em 1
        order: order?.order ? orderableColumn?.accessorKey : undefined,
        sort: order?.sort ?? undefined,
      });
      setPageIndex(0);
    },
    [searchValue, onFilterChange, order?.sort, columns, order?.order]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPageIndex(newPage);
      onFilterChange?.({
        search: searchValue,
        filterDate: selectedDate?.toISOString(),
        page: newPage + 1, // API espera páginas baseadas em 1, não em 0
        order: order?.order ?? undefined,
        sort: order?.sort ?? undefined,
      });
    },
    [searchValue, selectedDate, onFilterChange, order?.order, order?.sort]
  );

  const handleSortChange = useCallback(() => {
    const newOrder =
      order?.sort === "asc"
        ? "desc"
        : order?.sort === "desc"
        ? undefined
        : "asc";

    const orderableColumn = columns.find((col) => col.isOrderable);
    const newOrderKey = newOrder ? orderableColumn?.accessorKey ?? null : null;

    setOrder({
      order: newOrderKey,
      sort: newOrder ?? undefined,
    });

    setPageIndex(0);
    onFilterChange?.({
      search: searchValue,
      filterDate: selectedDate?.toISOString(),
      page: 1, // API espera páginas baseadas em 1
      order: newOrderKey ?? undefined,
      sort: newOrder ?? undefined,
    });
  }, [
    order?.sort,
    searchValue,
    selectedDate,
    onFilterChange,
    columns,
    setOrder,
  ]);

  return (
    <>
      <div className="border rounded-md bg-white mt-4 md:mt-10 mx-2 md:mx-10 p-3 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-4">
          {/* 🔍 Search */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={placeholderInput}
              className="pl-9 w-full"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* 📅 Filtro por data */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 border w-full sm:w-auto"
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
          <div className="w-full sm:w-auto sm:ml-auto">{children}</div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : table.getRowModel().rows.length ? (
            <div className="overflow-x-auto">
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
                                {order?.sort && (
                                  <span className="text-xs">
                                    {order.sort === "asc" ? "↑" : "↓"}
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
                      className={`h-16 ${
                        getRowClassName?.(row.original) ?? ""
                      } ${
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
                        <TableCell key={cell.id} className="py-4">
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
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center py-10 ">
              <Image src="/Empty.svg" alt="logo" width={200} height={200} />
              <p className="font-semibold text-xl">Nada por aqui ainda...</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 my-3 md:my-5 px-2">
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
        <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-black px-3 text-xs md:text-sm font-medium text-white">
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
