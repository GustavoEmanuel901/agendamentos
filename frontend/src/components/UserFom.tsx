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
import { apiError } from "@/utils/apiError";

interface UserFormProps {
  type: "register" | "edit";
}

export default function UserForm({ type }: UserFormProps) {
  const router = useRouter();
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [isLoadingZipCode, setIsLoadingZipCode] = useState(false);
  const [ZipCodeError, setZipCodeError] = useState<string>("");

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
      name: "",
      last_name: "",
      email: "",
      password: "",
      zip_code: "",
      address: "",
      number: "",
      supplement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  // Observa o valor do ZipCode
  const ZipCodeValue = watch("zip_code");

  // Função para buscar endereço pelo ZipCode
  const searchAddressByZipCode = async (zip_code: string) => {
    // Remove caracteres não numéricos
    const zipCodeNumeric = zip_code.replace(/\D/g, "");

    if (zipCodeNumeric.length !== 8) {
      return null;
    }

    setIsLoadingZipCode(true);
    setZipCodeError("");

    try {
      const data = await axios.get<ViaCEPResponse>(
        `https://viacep.com.br/ws/${zipCodeNumeric}/json/`
      );

      if (data.data.erro) {
        setZipCodeError("ZipCode não encontrado");
        return null;
      }

      return data;
    } catch (error) {
      apiError(error, "Erro ao buscar endereço pelo ZipCode.");
    } finally {
      setIsLoadingZipCode(false);
    }
  };

  // Efeito para buscar ZipCode quando estiver completo
  useEffect(() => {
    const getZipCode = async () => {
      const zipCodeNumeric = ZipCodeValue?.replace(/\D/g, "");

      if (zipCodeNumeric?.length === 8) {
        const address = await searchAddressByZipCode(ZipCodeValue);

        if (address) {
          // Preenche os campos com os dados da API
          setValue("address", address.data.logradouro);
          setValue("neighborhood", address.data.bairro);
          setValue("city", address.data.localidade);
          setValue("state", address.data.estado);
          setValue("supplement", address.data.complemento || "");

          // Mostra os campos de endereço
          if (!showAddressFields) setShowAddressFields(true);

          // Valida os campos preenchidos
          await trigger(["address", "neighborhood", "city", "state"]);
        } else {
          // Se não encontrou o ZipCode, ainda mostra os campos para preenchimento manual
          setShowAddressFields(true);
        }
      } else if (zipCodeNumeric && zipCodeNumeric.length < 8) {
        setShowAddressFields(false);
        setZipCodeError("");
      }
    };

    // Debounce para não fazer requisição a cada tecla
    const timeoutId = setTimeout(getZipCode, 800);
    return () => clearTimeout(timeoutId);
  }, [ZipCodeValue, setValue, trigger, showAddressFields]);

  useEffect(() => {
    const getUserData = async () => {
      if (type === "edit" && user?.id) {
        try {
          const response = await api.get(`/user/${user.id}`);
          const userData = response.data;

          // Preenche os campos do formulário
          setValue("name", userData.name || "");
          setValue("last_name", userData.last_name || "");
          setValue("email", userData.email || "");
          setValue("zip_code", userData.zip_code || "");
          setValue("address", userData.address || "");
          setValue("number", userData.number || "");
          setValue("supplement", userData.supplement || "");
          setValue("neighborhood", userData.neighborhood || "");
          setValue("city", userData.city || "");
          setValue("state", userData.state || "");

          // Se tiver CEP, mostra os campos de endereço
          if (userData.zip_code) setShowAddressFields(true);
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    };

    getUserData();
  }, [type, user?.id, setValue]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (type === "edit") {
        await api.put(`/user/${user?.id}`, data);
        toast.success("Dados atualizados com sucesso!");
        return;
      }

      const response = await api.post("/user", data);

      setUser({
        name: response.data.name,
        is_admin: response.data.is_admin,
        permissions: response.data.permissions,
        id: response.data.id,
      });

      toast.success("Cadastro realizado com sucesso!");

      if (response.status === 201) router.replace("/agendamentos");
    } catch (error) {
      apiError(error, "Erro ao enviar dados do usuário.");
    }
  };

  // Máscara para ZipCode
  const formatZipCode = (value: string) => {
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
                  name="name"
                  placeholder="Digite seu nome"
                  register={register}
                  required
                  error={errors.name}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Sobrenome"
                  name="last_name"
                  placeholder="Digite seu sobrenome"
                  register={register}
                  required
                  error={errors.last_name}
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
              {type === "register" && (
                <Input
                  type="password"
                  label="Senha"
                  name="password"
                  placeholder="********"
                  register={register}
                  required
                  error={errors.password}
                  showPasswordToggle={true}
                />
              )}
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
                      errors.zip_code || ZipCodeError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }
                    ${isLoadingZipCode ? "pr-12" : ""}
                  `}
                  {...register("zip_code", {
                    onChange: (e) => {
                      const formatted = formatZipCode(e.target.value);
                      e.target.value = formatted;
                    },
                  })}
                />

                {isLoadingZipCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {(errors.zip_code || ZipCodeError) && (
                <p className="mt-1 text-red-500 text-sm sm:text-base">
                  {errors.zip_code?.message || ZipCodeError}
                </p>
              )}
            </div>

            {showAddressFields && (
              <div className="animate-fadeIn space-y-4 sm:space-y-6">
                <Input
                  type="text"
                  label="Endereço (Rua/Avenida)"
                  name="address"
                  placeholder="Digite o nome da rua ou avenida"
                  register={register}
                  error={errors.address}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Número"
                  name="number"
                  placeholder="Nº"
                  register={register}
                  error={errors.number}
                  disabled={isLoadingZipCode}
                />

                <Input
                  type="text"
                  label="Complemento"
                  name="supplement"
                  placeholder="Apto, Bloco, etc. (opcional)"
                  register={register}
                  error={errors.supplement}
                  disabled={isLoadingZipCode}
                />

                <Input
                  type="text"
                  label="Bairro"
                  name="neighborhood"
                  placeholder="Digite o bairro"
                  register={register}
                  error={errors.neighborhood}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Cidade"
                  name="city"
                  placeholder="Digite a cidade"
                  register={register}
                  error={errors.city}
                  disabled={true}
                />

                <Input
                  type="text"
                  label="Estado"
                  name="state"
                  placeholder="UF"
                  register={register}
                  error={errors.state}
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
