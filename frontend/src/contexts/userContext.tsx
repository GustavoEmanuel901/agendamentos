"use client";

import { createContext, useContext, useState } from "react";

export interface User {
  name: string;
  id: number;
  is_admin: boolean;
  permissions: {
    logs: boolean;
    appointments: boolean;
  };
}

interface UserContextData {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function clearUser() {
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
