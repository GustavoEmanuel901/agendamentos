"use client";

import DashboardScreen from "@/components/DashboardScreen";
import SidebarComponent from "@/components/SidebarComponent";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Appointment, Log } from "@/types/types";
import { useState, useEffect } from "react";
import { columns, logColumns } from "@/utils/columns";
import api from "@/services/api";
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

const Agendamentos = () => {
  const data: Appointment[] = []; // Exemplo de dados vazios
  const [selectedItem, setSelectedItem] = useState<string>("Agendamentos");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [logs, setLogs] = useState<Log[]>([]);

  const { user,  } = useUser();
  const router = useRouter();

  useEffect(() => {
    
    // if (!user) {
    //   router.push("/");
    //   return;
    // }

    const fetchLogs = async () => {
      try {
        const response = await api.get<Log[]>("/logs");
        const  logsData = response.data;
        setLogs(logsData);
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
      }
    };

    fetchLogs();
  }, [router]);

  

  // if (!user) {
  //   return null;
  // }

  return (
    <SidebarProvider>
      <div className="flex flex-row flex-1 h-screen">
        <SidebarComponent
          nome={"Teste"}
          tipo={"cliente"}
          selectedItem={selectedItem}
          onSelect={setSelectedItem}
        />
        <SidebarInset className="flex flex-col flex-1 min-h-0 w-full bg-white">
          {selectedItem === "Agendamentos" && (
            <DashboardScreen
              title="Agendamentos"
              subtitle="Gerencie seus agendamentos"
              data={data}
              columns={columns}
              showActionButton={true}
            >
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button variant="default">Novo Agendamento</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        Novo Agendamento
                      </DialogTitle>
                    </DialogHeader>

                    <Separator />

                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="date-1">Data</Label>
                        <Input
                          id="date-1"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="time-1">Horário</Label>
                        <Input
                          id="time-1"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3 ">
                        <Label>Serviço</Label>
                        <Select value={service} onValueChange={setService}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corte">
                              Corte de Cabelo
                            </SelectItem>
                            <SelectItem value="barba">Barba</SelectItem>
                            <SelectItem value="coloracao">Coloração</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <DialogFooter>
                      <Button className="w-full my-2" type="submit">
                        Confirmar Agendamento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
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
            />
          )}
          {selectedItem === "Minha Conta" && (
            <DashboardScreen
              title="Minha Conta"
              subtitle="Gerencie suas informações pessoais"
              data={[]}
              columns={[]}
            />
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Agendamentos;
