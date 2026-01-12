// components/DataTable/columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Appointment, Log } from "../types/types";

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

export const logColumns: ColumnDef<Log>[] = [
  {
    accessorKey: "descricao",
    header: "Tipo de Atividade",
  },
  {
    accessorKey: "modulo",
    header: "Módulo",
  },
  {
    accessorKey: "data_criacao",
    header: "Data/Hora",
    cell: ({ row }) => {
      const date = new Date(row.original.data_criacao);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR")}`;
    },
  },
];
