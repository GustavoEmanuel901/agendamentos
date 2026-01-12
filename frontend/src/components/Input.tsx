import React, { InputHTMLAttributes, useState } from "react";
import { RegisterOptions, UseFormRegister, FieldError } from "react-hook-form";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password";
  label: string;
  placeholder?: string;
  required?: boolean;
  name: string;
  // eslint-disable-next-line
  register: UseFormRegister<any>;
  validation?: RegisterOptions;
  error?: FieldError;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  label,
  placeholder,
  required = false,
  name,
  register,
  validation,
  error,
  showPasswordToggle = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label} {required && <span>(Obrigatório)</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition duration-200
            ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            ${
              rest.disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white"
            }
            ${isPassword ? "pr-12" : ""}
            
          `}
          {...rest}
          {...register(name, validation)}
        />

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <AiFillEye size={20} />
            ) : (
              <AiFillEyeInvisible size={20} />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default Input;
