"use client";

import DashboardScreen from "@/components/DashboardScreen";
import SidebarComponent from "@/components/SidebarComponent";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  ApiResponse,
  Appointment,
  Log,
  Room,
  Client,
  DataTableFilters,
  TimeBlocks,
} from "@/types/types";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAppointmentColumns,
  getClientColumns,
  logColumns,
} from "@/utils/columns";
import api from "@/services/api";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentSchema,
  AppointmentFormData,
} from "@/schemas/appointment.schema";

import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserForm from "@/components/UserFom";
import HeaderTable from "@/components/HeaderTable";
import { items, SidebarItemTipoEnum } from "@/utils/sidebarItems";
import DialogFormWrapper from "@/components/DialogFormWrapper";
import { RoomFormData, roomSchema } from "@/schemas/room.schema";
import { Plus, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiError } from "@/utils/apiError";

const Agendamentos = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("Agendamentos");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    filterDate: "",
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [roomSearchEdit, setRoomSearchEdit] = useState("");
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [timeBlocks, setTimeBlocks] = useState<TimeBlocks[]>([]);
  const [selectedTimeBlocks, setSelectedTimeBlocks] = useState<string[]>([]);
  //const [selectedStatus, setSelectedStatus] = useState("");
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const columnsAppointment = useMemo(
    () =>
      getAppointmentColumns(
        () =>
          fetchAppointments({
            search: filters.search,
            filterDate: filters.filterDate,
            page: pagination.page + 1,
          }),
        user?.is_admin
      ),
    [filters, pagination.page, user?.is_admin]
  );

  const columnsClients = useMemo(
    () =>
      getClientColumns(() =>
        fetchClients({
          search: filters.search,
          filterDate: filters.filterDate,
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
      date: "",
      time: "",
      room_id: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
    setValue: setValueEdit,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      start_time: "",
      end_time: "",
      name: "",
    },
  });

  // Buscar agendamentos com filtros
  const fetchAppointments = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newFilters?.search) params.append("search", newFilters.search);
      if (newFilters?.filterDate)
        params.append("filterDate", newFilters.filterDate);
      if (newFilters?.order) params.append("order", newFilters.order);
      if (newFilters?.sort) params.append("sort", newFilters.sort);
      params.append("page", String(newFilters?.page ?? 1));
      // params.append("limit", "10");

      const response = await api.get<ApiResponse<Appointment>>(
        `/appointments?${params.toString()}`
      );

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
  const fetchLogs = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      console.log("Fetching logs with filters:", newFilters);

      const params = new URLSearchParams();
      if (newFilters?.search) params.append("search", newFilters.search);
      if (newFilters?.filterDate)
        params.append("filterDate", newFilters.filterDate);
      if (newFilters?.order) params.append("order", newFilters.order);
      if (newFilters?.sort) params.append("sort", newFilters.sort);
      params.append("page", String(newFilters?.page ?? 1));
      // params.append("limit", "10");

      const response = await api.get<ApiResponse<Log>>(
        `/logs?${params.toString()}`
      );

      setLogs(response.data.data);
      setPagination({
        page: response.data.meta.page - 1,
        totalPages: response.data.meta.total_pages,
      });
    } catch (error) {
      apiError(error, "Erro ao buscar logs");
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar serviços para o select
  const fetchRooms = async (searchTerm?: string) => {
    setRoomsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const url = searchTerm ? `/rooms?${params.toString()}` : `/rooms`;
      const response = await api.get<Room[]>(url);

      setRooms(response.data);
    } catch (e) {
      apiError(e, "Erro ao buscar salas");
    } finally {
      setRoomsLoading(false);
    }
  };

  // Buscar opções de status do backend (apenas para visualização)
  const fetchTimeBlocks = async (preselectedIds?: string[]) => {
    setLoadingTimeBlocks(true);
    try {
      const response = await api.get(`/timeblocks`);
      setTimeBlocks(response.data);

      // Se foram fornecidos IDs pré-selecionados, usar eles
      if (preselectedIds && preselectedIds.length > 0)
        setSelectedTimeBlocks(preselectedIds);
      // Caso contrário, nenhum bloco selecionado
      else setSelectedTimeBlocks([]);
    } catch (error) {
      apiError(error, "Erro ao buscar blocos de horário");
    } finally {
      setLoadingTimeBlocks(false);
    }
  };
  // Buscar detalhes do agendamento (nome da sala e horários)
  // const fetchAppointmentDetails = async (appointmentId: string) => {
  //   try {
  //     const response = await api.get(`/appointments/${appointmentId}`);
  //     const data = response.data;

  //     // Preencher o formulário com os dados da API
  //     if (data.room?.nome) {
  //       setRoomSearchEdit(data.room.nome);
  //       setValueEdit("nome", data.room.nome);
  //     }

  //     if (data.horario_inicio) {
  //       setTimeRange((prev) => ({ ...prev, inicio: data.horario_inicio }));
  //       setValueEdit("horario_inicio", data.horario_inicio);
  //     }

  //     if (data.horario_fim) {
  //       setTimeRange((prev) => ({ ...prev, fim: data.horario_fim }));
  //       setValueEdit("horario_fim", data.horario_fim);
  //     }

  //     console.log("Detalhes do agendamento carregados:", data);
  //   } catch (error) {
  //     console.error("Erro ao buscar detalhes do agendamento:", error);
  //     toast.error("Erro ao carregar detalhes do agendamento");
  //   }
  // };
  // Buscar detalhes da sala
  const fetchRoomDetail = useCallback(
    async (roomId: string) => {
      try {
        const response = await api.get(`/room/${roomId}`);
        const data = response.data;

        // Preencher o formulário com os dados da API
        if (data.name) {
          setRoomSearchEdit(data.name);
          setValueEdit("name", data.name);
        }

        if (data.start_time) {
          setTimeRange((prev) => ({ ...prev, inicio: data.start_time }));
          setValueEdit("start_time", data.start_time);
        }

        if (data.end_time) {
          setTimeRange((prev) => ({ ...prev, fim: data.end_time }));
          setValueEdit("end_time", data.end_time);
        }

        // Buscar time_blocks e pré-selecionar os que pertencem a essa sala
        if (data.time_blocks && data.time_blocks.length > 0) {
          const timeblockIds = data.time_blocks.map((tb: TimeBlocks) => tb.id);

          await fetchTimeBlocks(timeblockIds);
        } else {
          await fetchTimeBlocks();
        }
      } catch (error) {
        apiError(error, "Erro ao buscar detalhes da sala");
      }
    },
    [setValueEdit]
  );

  // Buscar clientes com filtros
  const fetchClients = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newFilters?.search) params.append("search", newFilters.search);
      if (newFilters?.filterDate)
        params.append("filterDate", newFilters.filterDate);
      if (newFilters?.order) params.append("order", newFilters.order);
      if (newFilters?.sort) params.append("sort", newFilters.sort);
      params.append("page", String(newFilters?.page ?? 1));
      // params.append("limit", "10");

      const response = await api.get<ApiResponse<Client>>(
        `/users/clients?${params.toString()}`
      );

      setClients(response.data.data);
      setPagination({
        page: response.data.meta.page - 1,
        totalPages: response.data.meta.total_pages,
      });
    } catch (error) {
      apiError(error, "Erro ao buscar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  // Submeter agendamento
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await api.post("/appointments", {
        ...data,
        room_id: Number(data.room_id),
      });

      reset();
      fetchAppointments();
      toast.success("Agendamento criado com sucesso!");
    } catch (error) {
      apiError(error, "Erro ao criar agendamento");
    }
  };

  // Editar sala/agendamento
  const onSubmitEdit = async (data: RoomFormData) => {
    if (!selectedAppointment) return;

    try {
      // selectedTimeBlocks já contém os IDs corretos dos time_blocks
      const newRoom = await api.post(`/room/${selectedAppointment.room.id}`, {
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        time_blocks: selectedTimeBlocks,
      });

      await api.put(`/appointments/${selectedAppointment.id}`, {
        room_id: newRoom.data.id,
      });

      resetEdit();
      setSelectedAppointment(null);
      setRoomSearchEdit("");
      setTimeRange({ start: "", end: "" });
      setSelectedTimeBlocks([]);
      fetchAppointments();

      toast.success("Agendamento atualizado com sucesso!");
    } catch (error) {
      apiError(error, "Erro ao atualizar agendamento");
    }
  };

  // Resetar formulário de edição
  const handleResetForm = () => {
    resetEdit();
    setRoomSearchEdit("");
    setTimeRange({ start: "", end: "" });
  };

  // Alternar seleção de time blocks
  const toggleTimeBlockSelection = (id: string) => {
    setSelectedTimeBlocks((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  // Buscar salas com debounce
  const debouncedFetchRooms = useCallback((searchTerm: string) => {
    const timeoutId = setTimeout(() => {
      fetchRooms(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timeoutId);
  }, []);

  const verifyPermissionLog = useCallback(() => {
    return user?.permissions.logs ?? false;
  }, [user]);

  const verifyPermissionAppointments = useCallback(() => {
    return user?.permissions.appointments ?? false;
  }, [user]);

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
  }, [verifyPermissionLog, verifyPermissionAppointments]);

  // Preencher formulário de edição quando um agendamento for selecionado
  useEffect(() => {
    if (selectedAppointment) {
      setRoomSearchEdit("");
      setTimeRange({ start: "", end: "" });
      setSelectedTimeBlocks([]);
      // Buscar detalhes da sala (que internamente já busca os time_blocks)
      fetchRoomDetail(selectedAppointment.room.id);
    }
  }, [selectedAppointment, fetchRoomDetail]);

  useEffect(() => {
    // Carregar dados ao mudar de aba
    if (selectedItem === "Agendamentos") {
      fetchAppointments();
      fetchRooms();
    } else if (selectedItem === "Logs") {
      fetchLogs();
    } else if (selectedItem === "Clientes" && user?.is_admin) {
      fetchClients();
    }

    console.log(user);
  }, [user, router, selectedItem]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row flex-1 h-screen bg-white">
        <SidebarComponent
          items={sidebarItems}
          name={user.name}
          type={
            user.is_admin
              ? SidebarItemTipoEnum.Admin
              : SidebarItemTipoEnum.Cliente
          }
          selectedItem={selectedItem}
          onSelect={setSelectedItem}
        />
        <SidebarInset className="flex flex-col flex-1 min-h-0 w-full bg-white overflow-auto">
          {selectedItem === "Agendamentos" && (
            <DashboardScreen
              title="Agendamento"
              subtitle="Acompanhe todos seus agendamentos de forma mais simples"
              placeholderInput="Filtre por nome"
              data={appointments}
              columns={columnsAppointment}
              showActionButton={true}
              isLoading={isLoading}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onFilterChange={(newFilters) => {
                setFilters({
                  search: newFilters.search ?? "",
                  filterDate: newFilters.filterDate ?? "",
                });
                fetchAppointments(newFilters);
              }}
              onRowSelect={(row) => {
                setSelectedAppointment(row);
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
              {user.is_admin ? (
                <>
                  {selectedAppointment && (
                    <DialogFormWrapper
                      buttonName="Ajustes de agendamento"
                      onSubmit={handleSubmitEdit(onSubmitEdit)}
                      isSubmitting={isSubmittingEdit}
                      title="Ajustes de agendamento"
                      buttonSubmitName="Salvar"
                    >
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="room-name">Nome da Sala</Label>
                          <Input
                            id="room-search"
                            type="text"
                            placeholder="Digite para buscar sala..."
                            value={roomSearchEdit}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRoomSearchEdit(value);
                              setValueEdit("name", value);
                              // Buscar salas no backend com debounce
                              if (value.length > 0) {
                                debouncedFetchRooms(value);
                              } else {
                                fetchRooms();
                              }
                            }}
                            className="mb-2"
                          />
                          {rooms.length > 0 &&
                            roomSearchEdit &&
                            !rooms.some(
                              (room) => room.name === roomSearchEdit
                            ) && (
                              <div className="border rounded-md max-h-40 overflow-y-auto">
                                {rooms.map((room) => (
                                  <div
                                    key={room.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setRoomSearchEdit(room.name);
                                      setValueEdit("name", room.name);
                                      // Buscar detalhes da sala (inclui time_blocks)
                                      fetchRoomDetail(room.id);
                                    }}
                                  >
                                    {room.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          <input type="hidden" {...registerEdit("name")} />
                          {errorsEdit.name && (
                            <span className="text-red-600 text-sm">
                              {errorsEdit.name.message}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-3">
                          <Label>Horário de Funcionamento</Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="time"
                                value={timeRange.start}
                                onChange={(e) => {
                                  setTimeRange({
                                    ...timeRange,
                                    start: e.target.value,
                                  });
                                  setValueEdit("start_time", e.target.value);
                                }}
                                placeholder="Início"
                              />
                            </div>
                            <span className="text-muted-foreground">até</span>
                            <div className="flex-1">
                              <Input
                                type="time"
                                value={timeRange.end}
                                onChange={(e) => {
                                  setTimeRange({
                                    ...timeRange,
                                    end: e.target.value,
                                  });
                                  setValueEdit("end_time", e.target.value);
                                }}
                                placeholder="Fim"
                              />
                            </div>
                          </div>
                          <input
                            type="hidden"
                            {...registerEdit("start_time")}
                          />
                          <input type="hidden" {...registerEdit("end_time")} />
                          {(errorsEdit.start_time || errorsEdit.end_time) && (
                            <span className="text-red-600 text-sm">
                              {errorsEdit.start_time?.message ||
                                errorsEdit.end_time?.message}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-3">
                          <Label>Bloco de horários de agendamentos</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                disabled={loadingTimeBlocks}
                              >
                                {loadingTimeBlocks
                                  ? "Carregando..."
                                  : `${selectedTimeBlocks.length} de ${timeBlocks.length} blocos selecionados`}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <div className="max-h-64 overflow-y-auto">
                                {loadingTimeBlocks ? (
                                  <div className="px-2 py-2 text-sm text-muted-foreground">
                                    Carregando...
                                  </div>
                                ) : timeBlocks.length ? (
                                  timeBlocks.map((timeblock) => (
                                    <div
                                      key={timeblock.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                                      onClick={() =>
                                        toggleTimeBlockSelection(timeblock.id)
                                      }
                                    >
                                      <Checkbox
                                        checked={selectedTimeBlocks.includes(
                                          timeblock.id
                                        )}
                                        onCheckedChange={() =>
                                          toggleTimeBlockSelection(timeblock.id)
                                        }
                                      />
                                      <span className="flex-1 text-sm">
                                        {timeblock.minutes} minutos
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-sm text-muted-foreground">
                                    Nenhum status disponível
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex justify-start">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResetForm}
                            disabled={isSubmittingEdit}
                          >
                            <Plus />
                            Adicionar nova sala
                          </Button>
                        </div>
                      </div>
                    </DialogFormWrapper>
                  )}
                </>
              ) : (
                <DialogFormWrapper
                  title="Novo Agendamento"
                  buttonName="Novo Agendamento"
                  onSubmit={handleSubmit(onSubmit)}
                  isSubmitting={isSubmitting}
                  buttonSubmitName="Confirmar Agendamento"
                >
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" type="date" {...register("date")} />
                      {errors.date && (
                        <span className="text-red-600 text-sm">
                          {errors.date.message}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="time">Horário</Label>
                      <Input id="time" type="time" {...register("time")} />
                      {errors.time && (
                        <span className="text-red-600 text-sm">
                          {errors.time.message}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 ">
                      <Label>Sala</Label>
                      <Controller
                        name="room_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={String(field.value)}
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
                                    {s.name}
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
                      {errors.room_id && (
                        <span className="text-red-600 text-sm">
                          {errors.room_id.message}
                        </span>
                      )}
                    </div>
                  </div>
                </DialogFormWrapper>
              )}
            </DashboardScreen>
          )}
          {selectedItem === "Clientes" && (
            <DashboardScreen
              title="Clientes"
              subtitle="Gerencie seus clientes"
              data={clients}
              columns={columnsClients}
              isLoading={isLoading}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onFilterChange={(newFilters) => {
                setFilters({
                  search: newFilters.search ?? "",
                  filterDate: newFilters.filterDate ?? "",
                });

                fetchClients(newFilters);
              }}
            />
          )}
          {selectedItem === "Logs" && (
            <DashboardScreen
              title="Logs"
              subtitle="Acompanhe todas as suas logs"
              data={logs}
              columns={logColumns}
              isLoading={isLoading}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              placeholderInput="Filtre por tipo de atividade ou módulo"
              onFilterChange={(newFilters) => {
                setFilters({
                  search: newFilters.search ?? "",
                  filterDate: newFilters.filterDate ?? "",
                });

                fetchLogs(newFilters);
              }}
            />
          )}
          {selectedItem === "Minha Conta" && (
            <>
              <HeaderTable
                title="Minha Conta"
                subtitle="Ajuste informações da sua conta de forma mais simples"
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
