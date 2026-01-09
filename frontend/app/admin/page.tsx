"use client";

import FormLogin from "@/components/FormLogin";
import Image from "next/image";

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <Image src="/Group.svg" alt="logo" width={40} height={40} />
      <h1 className="text-3xl font-bold text-gray-900 mt-6 ">Login Admin</h1>
      <FormLogin disableShowPasswordField={true} showFooterLinks={false} />
    </div>
  );
};

export default Admin;
