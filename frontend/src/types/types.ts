import { ColumnDef } from "@tanstack/react-table";

// components/DataTable/types.ts
export type Appointment = {
  id: string;
  name: string;
  email: string;
  room: Room;
  status: "agendado" | "Em análise" | "cancelado";
  data_agendamento: string; // ISO string
};

export type Log = {
  id: string;
  descricao: string;
  modulo: string;
  data_criacao: string; // ISO string
};

export type Room = {
  id: string;
  nome: string;
};

export type Client = {
  permissoes: {
    agendamentos: boolean;
    logs: boolean;
  };
  user: {
    id: string;
    nome: string;
    tipo: "admin" | "cliente";
  };
  nome: string;
  endereco: string;
  data_criacao: string; // ISO string
  status: boolean;
};

export type Columns<T> = ColumnDef<T> & {
  accessorKey?: string;
  header: string;
  type: "normal" | "conjunto" | "badge" | "action";
  variant?:
    | "secondary"
    | "default"
    | "destructive"
    | "outline"
    | null
    | undefined;

  isOrderable?: boolean;
};

export type ApiResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
};

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  estado: string;
  erro?: boolean;
}

export interface DataTableFilters {
  pesquisa?: string;
  data?: string;
  page?: number;
  ordenacao?: string;
  ordem?: "asc" | "desc";
}

export interface TimeBlocks {
  id: string;
  minutos: number;
}

// Vou ter que criar types para cada tabela ou mandar do backend já pronto?
