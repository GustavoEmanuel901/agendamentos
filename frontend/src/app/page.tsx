// app/login/page.tsx
"use client";

import React from "react";
import Header from "@/components/Header";
import FormLogin from "@/components/FormLogin";

const Home: React.FC = () => {
  return (
    <>
      <Header buttonLabel="Cadastre-se" route="/cadastro" />

      <div className="flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Entre na sua conta
            </h1>
          </div>
        </div>

        <FormLogin />
      </div>
    </>
  );
};

export default Home;
