// components/DataTable/types.ts
export type Appointment = {
  id: string;
  name: string;
  email: string;
  date: string; // ISO string
};

export type Log = {
  id: string;
  descricao: string;
  modulo: string;
  data_criacao: string; // ISO string
};

// Vou ter que criar types para cada tabela ou mandar do backend já pronto?