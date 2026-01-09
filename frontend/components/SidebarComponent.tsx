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
import {
  CalendarRange,
  ChevronDown,
  ListCheck,
  User,
  Users,
} from "lucide-react";

interface SidebarProps {
  nome: string;
  tipo: "admin" | "cliente";
  selectedItem?: string;
  onSelect?: (title: string) => void;
}

const items = [
  {
    title: "Agendamentos",
    url: "#",
    icon: CalendarRange,
    tipo: "global",
  },
  {
    title: "Clientes",
    url: "#",
    icon: Users,
    tipo: "admin",
  },
  {
    title: "Logs",
    url: "#",
    icon: ListCheck,
    tipo: "global",
  },
  {
    title: "Minha Conta",
    url: "#",
    icon: User,
    tipo: "cliente",
  },
];

const SidebarComponent: React.FC<SidebarProps> = ({
  nome,
  tipo,
  selectedItem,
  onSelect,
}) => {
  const [selected, setSelected] = useState<string | null>(selectedItem ?? null);

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
          <button>
            <ChevronDown size={20} color="#919191ff" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
