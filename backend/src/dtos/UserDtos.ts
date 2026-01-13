export interface UserClienteDto {
  id: number;
  permissoes: {
    pode_agendamentos: boolean;
    pode_logs: boolean;
  };
  tipo: "admin" | "cliente";
  data_cadastro: Date;
  endereco: string;
  status: boolean;
  nome: string;
}

export interface ListarDto {
  pagina: string;
  limite: string;
  pesquisa: string;
  data: string;
  ordem: string;
  ordenacao: "desc" | "asc";
}
