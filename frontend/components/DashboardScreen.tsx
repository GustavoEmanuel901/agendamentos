import { DataTable } from "@/components/DataTable";
import HeaderTable from "./HeaderTable";
import { ColumnDef } from "@tanstack/react-table";

interface DashboardScreenProps<TData> {
  title: string;
  subtitle: string;
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  showActionButton?: boolean;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export default function DashboardScreen<TData>({
  title,
  subtitle,
  data,
  columns,
  children,
}: DashboardScreenProps<TData>) {
  // Temporario
  return (
    <div className="flex flex-col flex-1 w-full min-h-0">
      <HeaderTable title={title} subtitle={subtitle} />
      <div className="flex-1 w-full min-h-0 overflow-auto">
        <DataTable columns={columns} data={data}>
          {children}
        </DataTable>
      </div>
    </div>
  );
}
