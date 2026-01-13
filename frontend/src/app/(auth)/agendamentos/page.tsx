"use client";

import DashboardScreen from "@/components/DashboardScreen";
import SidebarComponent, {
  SidebarItemProps,
} from "@/components/SidebarComponent";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ApiResponse, Appointment, Log, Room } from "@/types/types";
import { useState, useEffect, useMemo } from "react";
import { getAppointmentColumns, logColumns } from "@/utils/columns";
import api from "@/services/api";
import { Form, useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentSchema,
  AppointmentFormData,
} from "@/schemas/appointment.schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserForm from "@/components/UserFom";
import HeaderTable from "@/components/HeaderTable";
import { items } from "@/utils/sidebarItems";

const Agendamentos = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("Agendamentos");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    pesquisa: "",
    data: "",
  });

  const { user } = useUser();
  const router = useRouter();

  const columns = useMemo(
    () =>
      getAppointmentColumns(() =>
        fetchAppointments({
          pesquisa: filters.pesquisa,
          data: filters.data,
          page: pagination.page + 1,
        })
      ),
    [filters, pagination.page]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      data: "",
      horario: "",
      sala_id: 0,
    },
  });

  // Buscar agendamentos com filtros
  const fetchAppointments = async (newFilters?: {
    pesquisa?: string;
    data?: string;
    page?: number;
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newFilters?.pesquisa) params.append("pesquisa", newFilters.pesquisa);
      if (newFilters?.data) params.append("data", newFilters.data);
      params.append("page", String(newFilters?.page ?? 1));
      params.append("limit", "10");

      const response = await api.get<ApiResponse<Appointment>>(
        `/appointments?${params.toString()}`
      );

      console.log("Agendamentos carregados:", response.data);

      setAppointments(response.data.data);
      setPagination({
        page: response.data.meta.page - 1,
        totalPages: response.data.meta.total_pages,
      });
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar logs com filtros
  const fetchLogs = async (newFilters?: {
    pesquisa?: string;
    data?: string;
    page?: number;
  }) => {
    setIsLoading(true);
    try {
      console.log("Fetching logs with filters:", newFilters);

      const params = new URLSearchParams();
      if (newFilters?.pesquisa) params.append("pesquisa", newFilters.pesquisa);
      if (newFilters?.data) params.append("data", newFilters.data);
      params.append("pagina", String(newFilters?.page ?? 1));
      params.append("limite", "10");

      const response = await api.get<ApiResponse<Log>>(
        `/logs?${params.toString()}`
      );

      setLogs(response.data.data);
      setPagination({
        page: response.data.meta.page - 1,
        totalPages: response.data.meta.total_pages,
      });

      console.log(response.data);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar serviços para o select
  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await api.get<Room[]>(`/rooms`);

      console.log("Serviços carregados:", response.data);

      setRooms(response.data);
    } catch (e) {
      console.error("Erro ao buscar serviços:", e);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Submeter agendamento
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      console.log(data);

      await api.post("/appointments", data);

      reset();
      // TODO: Mostrar toast de sucesso e recarregar lista
      fetchAppointments();

      console.log("Agendamento criado com sucesso");

      toast.success("Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      // TODO: Mostrar toast de erro
    }
  };

  const verifyPermissionLog = () => {
    return user?.permissions.logs ?? false;
  };

  const verifyPermissionAppointments = () => {
    console.log("User Permissions:", user?.permissions);
    return user?.permissions.appointment ?? false;
  };

  const sidebarItems = useMemo(() => {
    return items.map((item) => {
      if (item.title === "Logs") {
        return { ...item, verifyPermission: verifyPermissionLog };
      }
      if (item.title === "Agendamentos") {
        return { ...item, verifyPermission: verifyPermissionAppointments };
      }
      return item;
    });
  }, [user]);

  useEffect(() => {
    // if (!user) {
    //   //router.push("/");
    //   return;
    // }

    // Carregar dados ao mudar de aba
    if (selectedItem === "Agendamentos") {
      fetchAppointments();
      fetchRooms();
    } else if (selectedItem === "Logs") {
      fetchLogs();
    }
  }, [user, router, selectedItem]);

  // if (!user) {
  //   return null;
  // }

  return (
    <SidebarProvider>
      <div className="flex flex-row flex-1 h-screen">
        <SidebarComponent
          items={sidebarItems}
          nome={user?.nome || "Usuário"}
          tipo={user?.role ? "admin" : "cliente"}
          selectedItem={selectedItem}
          onSelect={setSelectedItem}
        />
        <SidebarInset className="flex flex-col flex-1 min-h-0 w-full bg-white">
          {selectedItem === "Agendamentos" && (
            <DashboardScreen
              title="Agendamentos"
              subtitle="Gerencie seus agendamentos"
              data={appointments}
              columns={columns}
              showActionButton={true}
              isLoading={isLoading}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onFilterChange={(newFilters) => {
                setFilters({
                  pesquisa: newFilters.pesquisa ?? "",
                  data: newFilters.data ?? "",
                });
                fetchAppointments(newFilters);
              }}
              getRowClassName={(row) => {
                const status = String(
                  (row as Appointment).status ?? ""
                ).toLowerCase();

                if (status === "agendado") {
                  return "bg-green-50 hover:bg-green-100";
                } else if (status === "cancelado") {
                  return "bg-red-50 hover:bg-red-100";
                }
                return "";
              }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default">Novo Agendamento</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        Novo Agendamento
                      </DialogTitle>
                    </DialogHeader>

                    <Separator />

                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="date">Data</Label>
                        <Input id="date" type="date" {...register("data")} />
                        {errors.data && (
                          <span className="text-red-600 text-sm">
                            {errors.data.message}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="time">Horário</Label>
                        <Input id="time" type="time" {...register("horario")} />
                        {errors.horario && (
                          <span className="text-red-600 text-sm">
                            {errors.horario.message}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-3 ">
                        <Label>Sala</Label>
                        <Controller
                          name="sala_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    roomsLoading
                                      ? "Carregando..."
                                      : "Selecione uma sala"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {roomsLoading ? (
                                  <SelectItem value="loading" disabled>
                                    Carregando...
                                  </SelectItem>
                                ) : (rooms ?? []).length ? (
                                  (rooms ?? []).map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.nome}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="empty" disabled>
                                    Nenhuma sala encontrada
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.sala_id && (
                          <span className="text-red-600 text-sm">
                            {errors.sala_id.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <DialogFooter>
                      <Button
                        className="w-full my-2"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Confirmando..."
                          : "Confirmar Agendamento"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </DashboardScreen>
          )}
          {selectedItem === "Clientes" && (
            <DashboardScreen
              title="Clientes"
              subtitle="Gerencie seus clientes"
              data={[]}
              columns={[]}
            />
          )}
          {selectedItem === "Logs" && (
            <DashboardScreen
              title="Logs"
              subtitle="Visualize os logs do sistema"
              data={logs}
              columns={logColumns}
              isLoading={isLoading}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onFilterChange={(newFilters) => {
                setFilters({
                  pesquisa: newFilters.pesquisa ?? "",
                  data: newFilters.data ?? "",
                });

                fetchLogs(newFilters);
              }}
            />
          )}
          {selectedItem === "Minha Conta" && (
            <>
              <HeaderTable
                title="Minha Conta"
                subtitle="Ajuste as informações da sua conta de forma mais simples"
              />
              <UserForm type="edit" />
            </>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Agendamentos;
