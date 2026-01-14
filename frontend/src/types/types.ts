import { ColumnDef } from "@tanstack/react-table";

// components/DataTable/types.ts
export type Appointment = {
  id: string;
  name: string;
  email: string;
  room: Room;
  status: "agendado" | "Em análise" | "cancelado";
  date_appointment: string; // ISO string
};

export type Log = {
  id: string;
  description: string;
  module: string;
  created_at: string; // ISO string
};

export type Room = {
  id: string;
  name: string;
  time_blocks: TimeBlocks[];
};

export type Client = {
  permissions: {
    appointments: boolean;
    logs: boolean;
  };
  user: {
    id: string;
    name: string;
    type: "Admin" | "Cliente";
  };
  name: string;
  address: string;
  created_at: string; // ISO string
  status: boolean;
};

export type Columns<T> = ColumnDef<T> & {
  accessorKey?: string;
  header: string;
  type: "normal" | "object" | "badge" | "action";
  objectKeys?: string[]; // Only for type "object"
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
  search?: string;
  filterDate?: string;
  page?: number;
  order?: string;
  sort?: "asc" | "desc";
}

export interface TimeBlocks {
  id: string;
  minutes: number;
}

export interface ApiError {
  status: number;
  response: {
    data: {
      message: string;
    };
  };
}
// Vou ter que criar types para cada tabela ou mandar do backend já pronto?
