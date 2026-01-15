import { CalendarIcon, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "./ui/button";
import { PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { useState } from "react";

interface FilterBarProps { 
    placeholderInput?: string;
    isLoading?: boolean;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSearchChange?: (search: string) => void;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDateChange?: (date: Date | undefined) => void;
    children?: React.ReactNode;
}

export default function FilterBar( {
    placeholderInput,
    isLoading,
    onSearchChange,
    onDateChange,
    children,
}: FilterBarProps) {
      const [searchValue, setSearchValue] = useState("");
      const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-4">
      {/* 🔍 Search */}
      <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholderInput}
          className="pl-9 w-full"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          disabled={isLoading}
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
            onSelect={(date) => {
              setSelectedDate(date);
              onDateChange?.(date);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* ➕ Botão */}
      <div className="w-full sm:w-auto sm:ml-auto">{children}</div>
    </div>
  );
}
