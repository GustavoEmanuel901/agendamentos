import { SidebarItemProps } from "@/components/SidebarComponent";
import { CalendarRange, ListCheck, User, Users } from "lucide-react";

export const items = [
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
] as SidebarItemProps[];
