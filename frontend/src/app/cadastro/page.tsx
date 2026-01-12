// app/cadastro/page.tsx
"use client";

import React from "react";
import Header from "@/components/Header";
import UserForm from "@/components/UserFom";

const CadastroPage: React.FC = () => {
  return (
    <>
      <Header buttonLabel="Login" route="/" />

      <UserForm type="register" />
    </>
  );
};

export default CadastroPage;
