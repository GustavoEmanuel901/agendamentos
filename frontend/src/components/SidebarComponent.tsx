"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Separator } from "./ui/separator";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "@/services/api";
import { useUser } from "@/contexts/userContext";
import { toast } from "sonner";

export interface SidebarItemProps {
  title: string;
  url: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  tipo: "admin" | "cliente" | "global";
  verifyPermission?: () => boolean;
}

interface SidebarProps {
  nome: string;
  items: SidebarItemProps[];
  tipo: "admin" | "cliente";
  selectedItem?: string;
  onSelect?: (title: string) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  nome,
  tipo,
  selectedItem,
  onSelect,
  items,
}) => {
  const [selected, setSelected] = useState<string | null>(selectedItem ?? null);


  const { clearUser } = useUser();

  const logout = async () => {
    // Implement logout functionality here

    try {
      await api.get("/logout");

      clearUser();

      // router.replace("/");
    } catch (error) {
      toast.error("Erro ao fazer logout." + error);
    }
  };

  React.useEffect(() => {
    if (selectedItem !== undefined) {
      setSelected(selectedItem);
    }
  }, [selectedItem]);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Image src="/Group.svg" alt="logo" width={40} height={40} />
      </SidebarHeader>

      <Separator />
      <SidebarContent>
        <SidebarMenu className="p-4">
          {items
            .filter((item) => item.tipo === "global" || item.tipo === tipo)
            .filter((item) =>
              item.verifyPermission ? item.verifyPermission() : true
            )
            .map((item) => {
              const isSelected = selected === item.title;
              return (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton asChild className="py-6">
                    <a
                      href={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelect) onSelect(item.title);
                        if (selectedItem === undefined) setSelected(item.title);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                        isSelected
                          ? "bg-black text-white"
                          : "hover:bg-gray-100 hover:text-black text-gray-800"
                      }`}
                    >
                      <item.icon />
                      <span className="text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarContent>

      <Separator />

      <SidebarFooter className="flex flex-row items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>{nome}</p>
          <p>{tipo}</p>
        </div>

        <div>
          <button onClick={logout}>
            <ChevronDown size={20} color="#919191ff" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
