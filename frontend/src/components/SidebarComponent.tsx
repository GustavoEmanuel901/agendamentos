"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Separator } from "./ui/separator";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "@/services/api";
import { useUser } from "@/contexts/userContext";
import { SidebarItemTipoEnum } from "@/utils/sidebarItems";
import { apiError } from "@/utils/apiError";

export interface SidebarItemProps {
  title: string;
  url: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  type: SidebarItemTipoEnum;
  verifyPermission?: () => boolean;
}

interface SidebarProps {
  name: string;
  items: SidebarItemProps[];
  type: SidebarItemTipoEnum;
  selectedItem?: string;
  onSelect?: (title: string) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  name,
  type,
  selectedItem,
  onSelect,
  items,
}) => {
  const [selected, setSelected] = useState<string | null>(selectedItem ?? null);
  const { isMobile, setOpenMobile } = useSidebar();

  const { clearUser } = useUser();

  const logout = async () => {
    try {
      await api.get("/logout");

      clearUser();
    } catch (error: unknown) {
      apiError(error, "Erro ao fazer logout.");
    }
  };

  React.useEffect(() => {
    if (selectedItem !== undefined) {
      setSelected(selectedItem);
    }
  }, [selectedItem]);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <Image src="/Group.svg" alt="logo" width={40} height={40} />
      </SidebarHeader>

      <Separator />
      <SidebarContent>
        <SidebarMenu className="p-4">
          {items
            .filter(
              (item) =>
                item.type === SidebarItemTipoEnum.Global || item.type === type
            )
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
                        // Fechar sidebar em mobile após selecionar item
                        if (isMobile) {
                          setOpenMobile(false);
                        }
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
          <p>{name}</p>
          <p>{type}</p>
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
