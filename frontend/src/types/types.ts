import { ColumnDef } from "@tanstack/react-table";

// components/DataTable/types.ts
export type Appointment = {
  id: string;
  name: string;
  email: string;
  status: "agendado" | "en análise" | "cancelado";
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

export type Columns<T> = ColumnDef<T> & {
  type: "normal" | "conjunto" | "badge" | "action";
  variant?:
    | "secondary"
    | "default"
    | "destructive"
    | "outline"
    | null
    | undefined;
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

// Vou ter que criar types para cada tabela ou mandar do backend já pronto?
