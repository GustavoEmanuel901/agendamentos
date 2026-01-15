import { ApiError } from "@/types/types";
import { toast } from "sonner";

export const apiError = (err: unknown, alt_text?: string) => {
  const apiError = err as ApiError;

  if (apiError.status === 401) return;

  if (apiError.response?.data?.message)
    toast.error(apiError.response.data.message);
  else toast.error(alt_text || "Erro ao fazer login");
};
