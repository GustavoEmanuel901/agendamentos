"use client";

import Input from "@/components/Input";
import api from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/userContext";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";

import { toast } from "sonner";

interface LoginFormData {
  email: string;
  senha: string;
}

interface FormLoginProps {
  disableShowPasswordField?: boolean;
  showFooterLinks?: boolean;
}

const FormLogin = ({
  disableShowPasswordField = false,
  showFooterLinks = true,
}: FormLoginProps) => {
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [emailIsValid, setEmailIsValid] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useUser();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<LoginFormData>({
    mode: "onChange",
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const emailValue = useWatch({
    control,
    name: "email",
  });

  // Valida o email e mostra/oculta o campo de senha
  useEffect(() => {
    const validateEmailAndShowPasswordField = async () => {
      if (disableShowPasswordField) {
        setShowPasswordField(true);

        if (!emailValue) {
          setEmailIsValid(false);
          return;
        }
        const isValid = await trigger("email");

        setEmailIsValid(isValid);
      } else {
        if (!emailValue) {
          setShowPasswordField(false);
          setEmailIsValid(false);
          return;
        }

        // Valida o email usando as regras do react-hook-form
        const isValid = await trigger("email");

        setEmailIsValid(isValid);

        // Se o email for válido, mostra o campo de senha
        if (isValid && !showPasswordField) {
          setShowPasswordField(true);
        }
        // Se o email for inválido e o campo de senha estiver visível, oculta
        else if (!isValid && showPasswordField) {
          setShowPasswordField(false);
          // Limpa o campo de senha quando o email é inválido
          clearErrors("senha");
        }
      }
    };
    const timeoutId = setTimeout(validateEmailAndShowPasswordField, 300);
    return () => clearTimeout(timeoutId);
  }, [
    emailValue,
    trigger,
    showPasswordField,
    clearErrors,
    disableShowPasswordField,
  ]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const response = await api.post("/login", data);

      setUser({
        nome: response.data.nome,
        role: response.data.role,
        id: response.data.user_id,
      });

      router.push("/agendamentos");
      // eslint-disable-next-line
    } catch (err: any) {
      console.log(err);

      if (err.status == 500) toast.error("Erro interno do servidor");
      else toast.error(err.response.data.error);

      setError(err.mensagem);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-6 px-4 border border-gray-200 rounded-lg sm:px-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            label="E-mail"
            name="email"
            register={register}
            validation={{
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "E-mail inválido",
              },
            }}
            required
            error={errors.email}
          />

          {showPasswordField && (
            <div className="animate-fadeIn">
              <Input
                type="password"
                label="Senha de acesso"
                name="senha"
                register={register}
                validation={{
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres",
                  },
                }}
                required
                placeholder="***********"
                error={errors.senha}
                showPasswordToggle={true}
              />
            </div>
          )}

          <div
            className={`transition-opacity duration-300 ${
              showPasswordField ? "opacity-100" : "opacity-50"
            }`}
          >
            <button
              type="submit"
              disabled={!emailIsValid || !showPasswordField}
              className={`
                  w-full flex justify-center p-2 border border-transparent rounded-md shadow-sm
                  text-sm font-medium text-white
                  transition duration-200
                  ${
                    !emailIsValid || !showPasswordField
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }
                `}
            >
              Acessar conta
            </button>
          </div>
        </form>
        {showFooterLinks && (
          <div className="mt-2 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Ainda não tem um cadastro?
              </p>
              <Link
                href="/cadastro"
                className="inline-block font-semibold text-black-600 hover:text-black-800 transition duration-200 text-sm"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLogin;
