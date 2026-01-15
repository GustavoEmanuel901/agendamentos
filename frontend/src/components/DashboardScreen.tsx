import DataTable from "@/components/DataTable";
import HeaderTable from "./HeaderTable";
import type {
  Columns as ColumnWithType,
  DataTableFilters,
} from "@/types/types";
import { useEffect } from "react";

interface DashboardScreenProps<TData> {
  title: string;
  subtitle: string;
  data: TData[];
  columns: ColumnWithType<TData>[];
  showActionButton?: boolean;
  onActionClick?: () => void;
  children?: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  isLoading?: boolean;
  placeholderInput?: string;
  onFilterChange?: (filters: DataTableFilters) => void;
  getRowClassName?: (row: TData) => string;
  onRowSelect?: (row: TData | null) => void;
}

export default function DashboardScreen<TData>({
  title,
  subtitle,
  data,
  columns,
  children,
  totalPages,
  currentPage,
  isLoading,
  placeholderInput,
  onFilterChange,
  getRowClassName,
  onRowSelect,
}: DashboardScreenProps<TData>) {
  useEffect(() => {
    // Any side effects if needed in the future
    console.log("DashboardScreen mounted or updated");
  }, []);
  // Temporario
  return (
    <div className="flex flex-col flex-1 w-full min-h-0">
      <HeaderTable title={title} subtitle={subtitle} />
      <div className="flex-1 w-full min-h-0 overflow-auto p-2 md:p-4">
        <DataTable
          columns={columns}
          data={data}
          totalPages={totalPages}
          currentPage={currentPage}
          isLoading={isLoading}
          placeholderInput={placeholderInput}
          onFilterChange={onFilterChange}
          getRowClassName={getRowClassName}
          onRowSelect={onRowSelect}
        >
          {children}
        </DataTable>
      </div>
    </div>
  );
}
