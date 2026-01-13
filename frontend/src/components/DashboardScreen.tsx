import { DataTable } from "@/components/DataTable";
import HeaderTable from "./HeaderTable";
import { ColumnDef } from "@tanstack/react-table";
import type { Columns as ColumnWithType } from "@/types/types";

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
  onFilterChange?: (filters: {
    pesquisa?: string;
    data?: string;
    page?: number;
  }) => void;
  getRowClassName?: (row: TData) => string;
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
  onFilterChange,
  getRowClassName,
}: DashboardScreenProps<TData>) {
  // Temporario
  return (
    <div className="flex flex-col flex-1 w-full min-h-0">
      <HeaderTable title={title} subtitle={subtitle} />
      <div className="flex-1 w-full min-h-0 overflow-auto">
        <DataTable
          columns={columns}
          data={data}
          totalPages={totalPages}
          currentPage={currentPage}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
          getRowClassName={getRowClassName}
        >
          {children}
        </DataTable>
      </div>
    </div>
  );
}
