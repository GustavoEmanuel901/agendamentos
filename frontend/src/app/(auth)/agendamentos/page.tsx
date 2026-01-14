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
import { useState, useEffect, useMemo } from "react";
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
import { items } from "@/utils/sidebarItems";
import DialogFormWrapper from "@/components/DialogFormWrapper";
import { RoomFormData, roomSchema } from "@/schemas/room.schema";
import { Plus, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    pesquisa: "",
    data: "",
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [roomSearchEdit, setRoomSearchEdit] = useState("");
  const [timeRange, setTimeRange] = useState({ inicio: "", fim: "" });
  const [timeBlocks, setTimeBlocks] = useState<TimeBlocks[]>([]);
  const [selectedTimeBlocks, setSelectedTimeBlocks] = useState<number[]>([]);
  //const [selectedStatus, setSelectedStatus] = useState("");
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const columnsAppointment = useMemo(
    () =>
      getAppointmentColumns(
        () =>
          fetchAppointments({
            pesquisa: filters.pesquisa,
            data: filters.data,
            page: pagination.page + 1,
          }),
        user?.role
      ),
    [filters, pagination.page, user?.role]
  );

  const columnsClients = useMemo(
    () =>
      getClientColumns(() =>
        fetchClients({
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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    control: controlEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
    setValue: setValueEdit,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      horario_inicio: "",
      horario_fim: "",
      nome: "",
    },
  });

  // Buscar agendamentos com filtros
  const fetchAppointments = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newFilters?.pesquisa) params.append("pesquisa", newFilters.pesquisa);
      if (newFilters?.data) params.append("data", newFilters.data);
      if (newFilters?.ordenacao)
        params.append("ordenacao", newFilters.ordenacao);
      if (newFilters?.ordem) params.append("ordem", newFilters.ordem);
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
  const fetchLogs = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      console.log("Fetching logs with filters:", newFilters);

      const params = new URLSearchParams();
      if (newFilters?.pesquisa) params.append("pesquisa", newFilters.pesquisa);
      if (newFilters?.data) params.append("data", newFilters.data);
      if (newFilters?.ordenacao)
        params.append("ordenacao", newFilters.ordenacao);
      if (newFilters?.ordem) params.append("ordem", newFilters.ordem);
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

  // Buscar opções de status do backend (apenas para visualização)
  const fetchTimeBlocks = async (
    roomId: string,
    preselectedIds?: string[]
  ) => {
    setLoadingTimeBlocks(true);
    try {
      const response = await api.get(`/room/${roomId}/timeblocks`);
      setTimeBlocks(response.data);

      // Se foram fornecidos IDs pré-selecionados, usar eles
      if (preselectedIds && preselectedIds.length > 0) {
        const indices = response.data
          .map((block: TimeBlocks, index: number) =>
            preselectedIds.includes(block.id) ? index : -1
          )
          .filter((index: number) => index !== -1);
        setSelectedTimeBlocks(indices);
      } else {
        // Caso contrário, pré-selecionar todos os blocos
        setSelectedTimeBlocks(
          response.data.map((_: TimeBlocks, index: number) => index)
        );
      }
    } catch (error) {
      console.error("Erro ao buscar opções de status:", error);
    } finally {
      setLoadingTimeBlocks(false);
    }
  };
  // Buscar detalhes do agendamento (nome da sala e horários)
  const fetchAppointmentDetails = async (appointmentId: string) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      const data = response.data;

      // Preencher o formulário com os dados da API
      if (data.room?.nome) {
        setRoomSearchEdit(data.room.nome);
        setValueEdit("nome", data.room.nome);
      }

      if (data.horario_inicio) {
        setTimeRange((prev) => ({ ...prev, inicio: data.horario_inicio }));
        setValueEdit("horario_inicio", data.horario_inicio);
      }

      if (data.horario_fim) {
        setTimeRange((prev) => ({ ...prev, fim: data.horario_fim }));
        setValueEdit("horario_fim", data.horario_fim);
      }

      console.log("Detalhes do agendamento carregados:", data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do agendamento:", error);
      toast.error("Erro ao carregar detalhes do agendamento");
    }
  };
  // Buscar detalhes da sala
  const fetchRoomDetail = async (roomId: string) => {
    try {
      const response = await api.get(`/room/${roomId}`);
      const data = response.data;

      // Preencher o formulário com os dados da API
      if (data.nome) {
        setRoomSearchEdit(data.nome);
        setValueEdit("nome", data.nome);
      }

      if (data.horario_inicio) {
        setTimeRange((prev) => ({ ...prev, inicio: data.horario_inicio }));
        setValueEdit("horario_inicio", data.horario_inicio);
      }

      if (data.horario_fim) {
        setTimeRange((prev) => ({ ...prev, fim: data.horario_fim }));
        setValueEdit("horario_fim", data.horario_fim);
      }

      // Buscar time_blocks e pré-selecionar os que pertencem a essa sala
      if (data.time_block_ids && data.time_block_ids.length > 0) {
        await fetchTimeBlocks(roomId, data.time_block_ids);
      } else {
        await fetchTimeBlocks(roomId);
      }

      console.log("Detalhes da sala carregados:", data);
    } catch (error) {
      console.error("Erro ao buscar detalhes da sala:", error);
      toast.error("Erro ao carregar detalhes da sala");
    }
  };

  // Buscar clientes com filtros
  const fetchClients = async (newFilters?: DataTableFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newFilters?.pesquisa) params.append("pesquisa", newFilters.pesquisa);
      if (newFilters?.data) params.append("data", newFilters.data);
      if (newFilters?.ordenacao)
        params.append("ordenacao", newFilters.ordenacao);
      if (newFilters?.ordem) params.append("ordem", newFilters.ordem);
      params.append("page", String(newFilters?.page ?? 1));
      params.append("limit", "10");

      const response = await api.get<ApiResponse<Client>>(
        `/users/clients?${params.toString()}`
      );

      console.log("Clientes carregados:", response.data);

      setClients(response.data.data);
      setPagination({
        page: response.data.meta.page - 1,
        totalPages: response.data.meta.total_pages,
      });
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submeter agendamento
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await api.post("/appointments", data);

      reset();
      fetchAppointments();

      console.log("Agendamento criado com sucesso");

      toast.success("Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  // Editar sala/agendamento
  const onSubmitEdit = async (data: RoomFormData) => {
    if (!selectedAppointment) return;

    try {
      // Mapear os índices selecionados para os IDs reais dos time_blocks
      const selectedTimeBlockIds = selectedTimeBlocks.map(
        (index) => timeBlocks[index].id
      );

      const newRoom = await api.post(`/room/${selectedAppointment.room.id}`, {
        nome: data.nome,
        horario_inicio: data.horario_inicio,
        horario_fim: data.horario_fim,
        time_block_ids: selectedTimeBlockIds,
      });

      await api.put(`/appointments/${selectedAppointment.id}`, {
        sala_id: newRoom.data.id,
      });

      resetEdit();
      setSelectedAppointment(null);
      setRoomSearchEdit("");
      setTimeRange({ inicio: "", fim: "" });
      setSelectedTimeBlocks([]);
      fetchAppointments();

      toast.success("Agendamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento");
    }
  };

  // Resetar formulário de edição
  const handleResetForm = () => {
    resetEdit();
    setRoomSearchEdit("");
    setTimeRange({ inicio: "", fim: "" });
  };

  // Alternar seleção de time blocks
  const toggleTimeBlockSelection = (index: number) => {
    setSelectedTimeBlocks((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  const verifyPermissionLog = () => {
    return user?.permissions.logs ?? false;
  };

  const verifyPermissionAppointments = () => {
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

  // Filtrar salas com base na busca
  const filteredRoomsEdit = useMemo(() => {
    if (!roomSearchEdit) return rooms;
    return rooms.filter((room) =>
      room.nome.toLowerCase().includes(roomSearchEdit.toLowerCase())
    );
  }, [rooms, roomSearchEdit]);

  // Preencher formulário de edição quando um agendamento for selecionado
  useEffect(() => {
    if (selectedAppointment) {
      setRoomSearchEdit("");
      setTimeRange({ inicio: "", fim: "" });
      setSelectedTimeBlocks([]);
      console.log("Selected appointment changed:", selectedAppointment);

      // Buscar detalhes da sala (que internamente já busca os time_blocks)
      fetchRoomDetail(selectedAppointment.room.id);
    }
  }, [selectedAppointment]);

  useEffect(() => {
    // Carregar dados ao mudar de aba
    if (selectedItem === "Agendamentos") {
      fetchAppointments();
      fetchRooms();
    } else if (selectedItem === "Logs") {
      fetchLogs();
    } else if (selectedItem === "Clientes" && user?.role) {
      fetchClients();
    }

    console.log(user);
  }, [user, router, selectedItem]);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-row flex-1 h-screen">
        <SidebarComponent
          items={sidebarItems}
          nome={user.nome || "Usuário"}
          tipo={user.role ? "admin" : "cliente"}
          selectedItem={selectedItem}
          onSelect={setSelectedItem}
        />
        <SidebarInset className="flex flex-col flex-1 min-h-0 w-full bg-white">
          {selectedItem === "Agendamentos" && (
            <DashboardScreen
              title="Agendamentos"
              subtitle="Gerencie seus agendamentos"
              data={appointments}
              columns={columnsAppointment}
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
              onRowSelect={(row) => {
                setSelectedAppointment(row);
                console.log("Agendamento selecionado:", row);
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
              {user.role ? (
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
                              setRoomSearchEdit(e.target.value);
                              setValueEdit("nome", e.target.value);
                            }}
                            className="mb-2"
                          />
                          {filteredRoomsEdit.length > 0 &&
                            roomSearchEdit &&
                            !rooms.some(
                              (room) => room.nome === roomSearchEdit
                            ) && (
                              <div className="border rounded-md max-h-40 overflow-y-auto">
                                {filteredRoomsEdit.map((room) => (
                                  <div
                                    key={room.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setRoomSearchEdit(room.nome);
                                      setValueEdit("nome", room.nome);
                                      // Buscar detalhes da sala (inclui time_blocks)
                                      fetchRoomDetail(room.id);
                                    }}
                                  >
                                    {room.nome}
                                  </div>
                                ))}
                              </div>
                            )}
                          <input type="hidden" {...registerEdit("nome")} />
                          {errorsEdit.nome && (
                            <span className="text-red-600 text-sm">
                              {errorsEdit.nome.message}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-3">
                          <Label>Horário de Funcionamento</Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="time"
                                value={timeRange.inicio}
                                onChange={(e) => {
                                  setTimeRange({
                                    ...timeRange,
                                    inicio: e.target.value,
                                  });
                                  setValueEdit(
                                    "horario_inicio",
                                    e.target.value
                                  );
                                }}
                                placeholder="Início"
                              />
                            </div>
                            <span className="text-muted-foreground">até</span>
                            <div className="flex-1">
                              <Input
                                type="time"
                                value={timeRange.fim}
                                onChange={(e) => {
                                  setTimeRange({
                                    ...timeRange,
                                    fim: e.target.value,
                                  });
                                  setValueEdit("horario_fim", e.target.value);
                                }}
                                placeholder="Fim"
                              />
                            </div>
                          </div>
                          <input
                            type="hidden"
                            {...registerEdit("horario_inicio")}
                          />
                          <input
                            type="hidden"
                            {...registerEdit("horario_fim")}
                          />
                          {(errorsEdit.horario_inicio ||
                            errorsEdit.horario_fim) && (
                            <span className="text-red-600 text-sm">
                              {errorsEdit.horario_inicio?.message ||
                                errorsEdit.horario_fim?.message}
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
                                  timeBlocks.map((status, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                                      onClick={() =>
                                        toggleTimeBlockSelection(index)
                                      }
                                    >
                                      <Checkbox
                                        checked={selectedTimeBlocks.includes(
                                          index
                                        )}
                                        onCheckedChange={() =>
                                          toggleTimeBlockSelection(index)
                                        }
                                      />
                                      <span className="flex-1 text-sm">
                                        {status.minutos} minutos
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
                  pesquisa: newFilters.pesquisa ?? "",
                  data: newFilters.data ?? "",
                });

                fetchClients(newFilters);
              }}
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
