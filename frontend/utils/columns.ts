// components/DataTable/columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "../types/types";

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString("pt-BR"),
  },
];
