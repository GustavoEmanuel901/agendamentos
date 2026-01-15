// components/DataTable/columns.ts
import { Appointment, Log, Columns, Client } from "../types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import api from "@/services/api";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { apiError } from "./apiError";
import { AppointmentStatus } from "./appointmentStatusEnum";

export const getAppointmentColumns = (
  onUpdate?: () => void,
  isAdmin?: boolean
): Columns<Appointment>[] => [
  {
    accessorKey: "date_appointment",
    header: "Data do Agendamento",
    isOrderable: true,
    type: "normal",
    accessorFn: (row) => {
      const date = new Date(row.date_appointment);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
  {
    accessorKey: "user",
    header: "Nome",
    type: "object",
    objectKeys: ["name", "type"],
  },
  {
    accessorKey: "room.name",
    header: "Sala do agendamento",
    type: "badge",
    variant: "default",
  },
  {
    accessorKey: "status",
    header: "Status",
    type: "badge",
    cell: ({ getValue }) => {
      const status = String(getValue() ?? "");

      let borderColor = "border-gray-300";

      if (status == AppointmentStatus.SCHEDULED) {
        borderColor = "border-green-500 text-green-700";
      } else if (status == AppointmentStatus.CANCELED) {
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

    cell: ({ row }) => {
      const style =
        row.original.status === AppointmentStatus.SCHEDULED && isAdmin
          ? "items-center justify-center"
          : "";

      return (
        <div className={`flex gap-2 ${style}`}>
          {row.original.status !== AppointmentStatus.CANCELED && (
            <>
              <Button
                variant="default"
                className="rounded-full"
                size="icon"
                onClick={async () => {
                  try {
                    await api.put(`/appointments/${row.original.id}`, {
                      status: AppointmentStatus.CANCELED,
                    });
                    toast.success("Agendamento cancelado com sucesso!");
                    onUpdate?.();
                  } catch (error) {
                    toast.error("Erro ao cancelar agendamento");
                    console.log(error);
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              {isAdmin &&
                row.original.status !== AppointmentStatus.SCHEDULED && (
                  <Button
                    variant="default"
                    className="rounded-full"
                    size="icon"
                    onClick={async () => {
                      try {
                        await api.put(`/appointments/${row.original.id}`, {
                          status: AppointmentStatus.SCHEDULED,
                        });
                        toast.success("Agendamento confirmado com sucesso!");
                        onUpdate?.();
                      } catch (error) {
                        toast.error("Erro ao confirmar agendamento");
                        console.log(error);
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
            </>
          )}
        </div>
      );
    },
  },
];

export const appointmentColumns: Columns<Appointment>[] =
  getAppointmentColumns();

export const getLogColumns = (): Columns<Log>[] => [
  {
    accessorKey: "user",
    header: "Cliente",
    type: "object",
    objectKeys: ["name", "type"],
  },
  {
    accessorKey: "description",
    header: "Tipo de Atividade",
    type: "badge",
    variant: "secondary",
  },
  {
    accessorKey: "module",
    header: "Módulo",
    type: "badge",
    variant: "secondary",
  },
  {
    accessorKey: "created_at",
    header: "Data e Horário",
    type: "badge",
    variant: "secondary",
    isOrderable: true,
    accessorFn: (row) => {
      const date = new Date(row.created_at);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
];

export const logColumns: Columns<Log>[] = getLogColumns();

export const getClientColumns = (
  onPermissionToggle?: () => void
): Columns<Client>[] => [
  {
    accessorKey: "created_at",
    header: "Data de Cadastro",
    type: "normal",
    isOrderable: true,
    accessorFn: (row) => {
      const date = new Date(row.created_at);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
  {
    accessorKey: "user",
    header: "Nome",
    type: "object",
    objectKeys: ["name", "type"],
  },
  {
    accessorKey: "address",
    header: "Endereço",
    type: "normal",
  },
  {
    accessorKey: "permissions",
    header: "Permissões",
    type: "action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Badge
          variant={
            row.original.permissions.appointments ? "default" : "outline"
          }
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={async () => {
            try {
              console.log(row.original);
              await api.put(`/user/${row.original.id}/permission`, {
                appointments: !row.original.permissions.appointments,
              });
              toast.success("Permissão atualizada com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              apiError("Erro ao atualizar permissão");
              console.log(error);
            }
          }}
        >
          Agendamentos
        </Badge>
        <Badge
          variant={row.original.permissions.logs ? "default" : "outline"}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={async () => {
            try {
              await api.put(`/user/${row.original.id}/permission`, {
                logs: !row.original.permissions.logs,
              });
              toast.success("Permissão atualizada com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              apiError("Erro ao atualizar permissão");
              console.log(error);
            }
          }}
        >
          Logs
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    type: "action",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.original.status}
          onCheckedChange={async (checked) => {
            try {
              await api.put(`/user/${row.original.id}/permission`, {
                status: checked,
              });
              toast.success("Status atualizado com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              apiError("Erro ao atualizar status");
            }
          }}
        />
      </div>
    ),
  },
];

export const clientColumns: Columns<Client>[] = getClientColumns();
