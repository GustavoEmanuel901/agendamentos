// components/DataTable/columns.ts
import { Appointment, Log, Columns } from "../types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { Check, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";

export const getAppointmentColumns = (
  onUpdate?: () => void
): Columns<Appointment>[] => [
  {
    accessorKey: "data_agendamento",
    header: "Data do Agendamento",
    type: "normal",
    accessorFn: (row) => {
      const date = new Date(row.data_agendamento);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
  {
    accessorKey: "user",
    header: "Nome",
    type: "conjunto",
  },
  {
    accessorKey: "room.nome",
    header: "Sala",
    type: "badge",
    variant: "default",
  },
  {
    accessorKey: "status",
    header: "Status",
    type: "badge",
    cell: ({ getValue }) => {
      const status = String(getValue() ?? "").toLowerCase();
      let borderColor = "border-gray-300";

      if (status === "agendado") {
        borderColor = "border-green-500 text-green-700";
      } else if (status === "cancelado") {
        borderColor = "border-red-500 text-red-700";
      }

      return (
        <Badge variant="outline" className={`capitalize ${borderColor}`}>
          {String(getValue() ?? "")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "",
    header: "Ações",
    type: "action",
    cell: ({ row }) => (
      <Button
        variant="default"
        className="rounded-full"
        size="icon"
        onClick={async () => {
          try {
            await api.put(`/appointments/${row.original.id}`, {
              status: "cancelado",
            });
            toast.success("Agendamento atualizado com sucesso!");
            onUpdate?.();
          } catch (error) {
            toast.error("Erro ao atualizar agendamento");
            console.error(error);
          }
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    ),
  },
];

export const columns: Columns<Appointment>[] = getAppointmentColumns();

export const logColumns: Columns<Log>[] = [
  {
    accessorKey: "user",
    header: "Cliente",
    type: "conjunto",
  },
  {
    accessorKey: "descricao",
    header: "Tipo de Atividade",
    type: "badge",
    variant: "secondary",
  },
  {
    accessorKey: "modulo",
    header: "Módulo",
    type: "badge",
    variant: "secondary",
  },
  {
    accessorKey: "data_criacao",
    header: "Data/Hora",
    type: "badge",
    accessorFn: (row) => {
      const date = new Date(row.data_criacao);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
];
