// components/DataTable/columns.ts
import { Appointment, Log, Columns, Client } from "../types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import api from "@/services/api";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

export const getAppointmentColumns = (
  onUpdate?: () => void,
  isAdmin?: boolean
): Columns<Appointment>[] => [
  {
    accessorKey: "data_agendamento",
    header: "Data do Agendamento",
    isOrderable: true,
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
    header: "Sala do agendamento",
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

    cell: ({ row }) => {
      console.log("Row data:", row.original);

      const style =
        row.original.status === "agendado" && isAdmin
          ? "items-center justify-center"
          : "";

      return (
        <div className={`flex gap-2 ${style}`}>
          {row.original.status !== "cancelado" && (
            <>
              <Button
                variant="default"
                className="rounded-full"
                size="icon"
                onClick={async () => {
                  try {
                    await api.put(`/appointments/${row.original.id}`, {
                      status: "cancelado",
                    });
                    toast.success("Agendamento cancelado com sucesso!");
                    onUpdate?.();
                  } catch (error) {
                    toast.error("Erro ao cancelar agendamento");
                    console.error(error);
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              {isAdmin && row.original.status !== "agendado" && (
                <Button
                  variant="default"
                  className="rounded-full"
                  size="icon"
                  onClick={async () => {
                    try {
                      await api.put(`/appointments/${row.original.id}`, {
                        status: "agendado",
                      });
                      toast.success("Agendamento confirmado com sucesso!");
                      onUpdate?.();
                    } catch (error) {
                      toast.error("Erro ao confirmar agendamento");
                      console.error(error);
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
    isOrderable: true,
    accessorFn: (row) => {
      const date = new Date(row.data_criacao);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR"
      )}`;
    },
  },
];

export const getClientColumns = (
  onPermissionToggle?: () => void
): Columns<Client>[] => [
  {
    accessorKey: "data_criacao",
    header: "Data de Cadastro",
    type: "normal",
    isOrderable: true,
    accessorFn: (row) => {
      const date = new Date(row.data_criacao);
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
    accessorKey: "endereco",
    header: "Endereço",
    type: "normal",
  },
  {
    accessorKey: "permissoes",
    header: "Permissões",
    type: "action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Badge
          variant={row.original.permissoes.agendamentos ? "default" : "outline"}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={async () => {
            try {
              await api.put(`/user/${row.original.user.id}/permission`, {
                agendamentos: !row.original.permissoes.agendamentos,
              });
              toast.success("Permissão atualizada com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              toast.error("Erro ao atualizar permissão");
              console.error(error);
            }
          }}
        >
          Agendamentos
        </Badge>
        <Badge
          variant={row.original.permissoes.logs ? "default" : "outline"}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={async () => {
            try {
              await api.put(`/user/${row.original.user.id}/permission`, {
                logs: !row.original.permissoes.logs,
              });
              toast.success("Permissão atualizada com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              toast.error("Erro ao atualizar permissão");
              console.error(error);
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
              await api.put(`/user/${row.original.user.id}/permission`, {
                status: checked,
              });
              toast.success("Status atualizado com sucesso!");
              onPermissionToggle?.();
            } catch (error) {
              toast.error("Erro ao atualizar status");
              console.error(error);
            }
          }}
        />
      </div>
    ),
  },
];

export const clientColumns: Columns<Client>[] = getClientColumns();
