import { ApiError } from "@/types/types";
import { toast } from "sonner";

export const apiError = (err: unknown, alt_text?: string) => {
  const apiError = err as ApiError;
  if (apiError.response?.data?.error) toast.error(apiError.response.data.error);
  else toast.error(alt_text || "Erro ao fazer login");
};
