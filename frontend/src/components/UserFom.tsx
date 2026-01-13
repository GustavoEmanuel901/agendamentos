import { useUser } from "@/contexts/userContext";
import { UserFormData, userSchema } from "@/schemas/user.schema";
import api from "@/services/api";
import { ViaCEPResponse } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "./Input";
import { toast } from "sonner";

interface UserFormProps {
  type: "register" | "edit";
}

export default function UserForm({ type }: UserFormProps) {
  const router = useRouter();
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState<string>("");

  const { setUser, user } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      senha: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  // Observa o valor do CEP
  const cepValue = watch("cep");

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepNumerico = cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      return null;
    }

    setIsLoadingCEP(true);
    setCepError("");

    try {
      const data = await axios.get<ViaCEPResponse>(
        `https://viacep.com.br/ws/${cepNumerico}/json/`
      );

      if (data.data.erro) {
        setCepError("CEP não encontrado");
        return null;
      }

      console.log("Endereço encontrado:", data.data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
      return null;
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Efeito para buscar CEP quando estiver completo
  useEffect(() => {
    const buscarCEP = async () => {
      const cepNumerico = cepValue?.replace(/\D/g, "");

      if (cepNumerico?.length === 8) {
        const endereco = await buscarEnderecoPorCEP(cepValue);

        if (endereco) {
          // Preenche os campos com os dados da API
          setValue("endereco", endereco.data.logradouro);
          setValue("bairro", endereco.data.bairro);
          setValue("cidade", endereco.data.localidade);
          setValue("estado", endereco.data.estado);
          setValue("complemento", endereco.data.complemento || "");

          // Mostra os campos de endereço
          if (!showAddressFields) {
            setShowAddressFields(true);
          }

          // Valida os campos preenchidos
          await trigger(["endereco", "bairro", "cidade", "estado"]);
        } else {
          // Se não encontrou o CEP, ainda mostra os campos para preenchimento manual
          setShowAddressFields(true);
        }
      } else if (cepNumerico && cepNumerico.length < 8) {
        setShowAddressFields(false);
        setCepError("");
      }
    };

    // Debounce para não fazer requisição a cada tecla
    const timeoutId = setTimeout(buscarCEP, 800);
    return () => clearTimeout(timeoutId);
  }, [cepValue, setValue, trigger, showAddressFields]);

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      if (type === "edit" && user?.id) {
        try {
          const response = await api.get(`/user/${user.id}`);
          const userData = response.data;

          // Preenche os campos do formulário
          setValue("nome", userData.nome || "");
          setValue("sobrenome", userData.sobrenome || "");
          setValue("email", userData.email || "");
          setValue("cep", userData.cep || "");
          setValue("endereco", userData.endereco || "");
          setValue("numero", userData.numero || "");
          setValue("complemento", userData.complemento || "");
          setValue("bairro", userData.bairro || "");
          setValue("cidade", userData.cidade || "");
          setValue("estado", userData.estado || "");

          // Se tiver CEP, mostra os campos de endereço
          if (userData.cep) {
            setShowAddressFields(true);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    };

    carregarDadosUsuario();
  }, [type, user?.id, setValue]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (type === "edit") {
        await api.put(`/user/${user?.id}`, data);
        toast.success("Dados atualizados com sucesso!");
        return;
      }

      api.post("/user", data).then((response) => {
        setUser({
          nome: response.data.nome,
          role: response.data.role,
          id: response.data.user_id,
        });

        toast.success("Cadastro realizado com sucesso!");

        if (response.status === 201) {
          router.push("/agendamentos");
        }
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    }
  };

  // Máscara para CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  return (
    <>
      {type === "register" && (
        <div className="flex flex-col justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-2xl lg:max-w-3xl">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Cadastre-se
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8 lg:mt-10 sm:mx-auto sm:w-full sm:max-w-2xl lg:max-w-3xl">
        <div className="bg-white py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg sm:rounded-xl">
          <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Input
                  type="text"
                  label="Nome"
                  name="nome"
                  placeholder="Digite seu nome"
                  register={register}
                  required
                  error={errors.nome}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Sobrenome"
                  name="sobrenome"
                  placeholder="Digite seu sobrenome"
                  register={register}
                  required
                  error={errors.sobrenome}
                />
              </div>
            </div>

            {/* Email */}
            <Input
              type="email"
              label="E-mail"
              name="email"
              placeholder="seu@email.com"
              register={register}
              required
              error={errors.email}
            />

            <div>
              <Input
                type="password"
                label="Senha"
                name="senha"
                placeholder="********"
                register={register}
                required
                error={errors.senha}
                showPasswordToggle={true}
              />
            </div>

            {/* CEP com campo customizado para máscara */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                CEP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="00000-000"
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition duration-200 text-sm sm:text-base
                    ${
                      errors.cep || cepError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }
                    ${isLoadingCEP ? "pr-12" : ""}
                  `}
                  {...register("cep", {
                    onChange: (e) => {
                      const formatted = formatCEP(e.target.value);
                      e.target.value = formatted;
                    },
                  })}
                />

                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {(errors.cep || cepError) && (
                <p className="mt-1 text-red-500 text-sm sm:text-base">
                  {errors.cep?.message || cepError}
                </p>
              )}
            </div>

            {showAddressFields && (
              <div className="animate-fadeIn space-y-4 sm:space-y-6">
                <Input
                  type="text"
                  label="Endereço (Rua/Avenida)"
                  name="endereco"
                  placeholder="Digite o nome da rua ou avenida"
                  register={register}
                  error={errors.endereco}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Número"
                  name="numero"
                  placeholder="Nº"
                  register={register}
                  error={errors.numero}
                  disabled={isLoadingCEP}
                />

                <Input
                  type="text"
                  label="Complemento"
                  name="complemento"
                  placeholder="Apto, Bloco, etc. (opcional)"
                  register={register}
                  error={errors.complemento}
                  disabled={isLoadingCEP}
                />

                <Input
                  type="text"
                  label="Bairro"
                  name="bairro"
                  placeholder="Digite o bairro"
                  register={register}
                  error={errors.bairro}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Cidade"
                  name="cidade"
                  placeholder="Digite a cidade"
                  register={register}
                  error={errors.cidade}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Estado"
                  name="estado"
                  placeholder="UF"
                  register={register}
                  error={errors.estado}
                  disabled={true}
                />
              </div>
            )}

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !showAddressFields}
                className={`
                  w-full flex justify-center items-center
                  py-2 sm:py-3 lg:py-4 
                  px-4 border border-transparent 
                  rounded-md sm:rounded-lg 
                  text-sm sm:text-base lg:text-lg 
                  text-white
                  font-medium text-white 
                  transition duration-200
                  ${
                    isSubmitting || !showAddressFields
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processando...
                  </>
                ) : type === "edit" ? (
                  "Salvar"
                ) : (
                  "Cadastre-se"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
