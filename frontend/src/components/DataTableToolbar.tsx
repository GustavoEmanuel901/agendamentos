// components/DataTable/data-table-toolbar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  children,
}: DataTableToolbarProps<TData>) {
  const dateColumn = table.getColumn("date");

  return (
    <div className="flex flex-wrap items-center">
      {/* 🔍 Search */}

      <div className="relative ">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filtrar por nome"
          className="pl-9 w-100"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
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
            onSelect={(date) => dateColumn?.setFilterValue(date?.toISOString())}
          />
        </PopoverContent>
      </Popover>

      {/* ➕ Botão */}
      <div className="ml-auto gap-2">{children}</div>
    </div>
  );
}
