"use client";

import { useUser, User } from "@/contexts/userContext";
import { useEffect } from "react";

export default function UserDataProvider({
  children,
  userData,
}: {
  children: React.ReactNode;
  userData: User;
}) {
  const { setUser } = useUser();

  useEffect(() => {
    setUser(userData);
  }, [userData, setUser]);

  return <>{children}</>;
}
