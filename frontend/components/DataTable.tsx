// components/DataTable/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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

export interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  children?: React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  children,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const dateColumn = table.getColumn("date");

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
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* 📅 Filtro por data */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="gap-2 border ml-4 w-30">
                <CalendarIcon className="h-4 w-4" />
                Selecione
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="p-0 ">
              <Calendar
                mode="single"
                selected={
                  dateColumn?.getFilterValue()
                    ? new Date(dateColumn.getFilterValue() as string)
                    : undefined
                }
                onSelect={(date) =>
                  dateColumn?.setFilterValue(date?.toISOString())
                }
              />
            </PopoverContent>
          </Popover>

          {/* ➕ Botão */}
          <div className="ml-auto gap-2">{children}</div>
        </div>
        {table.getRowModel().rows.length ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Página atual */}
        <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white">
          {table.getState().pagination.pageIndex + 1}
        </span>

        {/* Próxima */}
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 rounded-md border"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
