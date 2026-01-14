import { SidebarItemProps } from "@/components/SidebarComponent";
import { CalendarRange, ListCheck, User, Users } from "lucide-react";

export enum SidebarItemTipoEnum {
  Admin = "Admin",
  Cliente = "Cliente",
  Global = "Global",
}

export const items = [
  {
    title: "Agendamentos",
    url: "#",
    icon: CalendarRange,
    type: SidebarItemTipoEnum.Global,
  },
  {
    title: "Clientes",
    url: "#",
    icon: Users,
    type: SidebarItemTipoEnum.Admin,
  },
  {
    title: "Logs",
    url: "#",
    icon: ListCheck,
    type: SidebarItemTipoEnum.Global,
  },
  {
    title: "Minha Conta",
    url: "#",
    icon: User,
    type: SidebarItemTipoEnum.Cliente,
  },
] as SidebarItemProps[];
