import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

interface HeaderTableProps {
  title: string;
  subtitle: string;
}

export default function HeaderTable({ title, subtitle }: HeaderTableProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="w-full flex items-center gap-3 p-3 md:p-5 bg-white border-b border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{title}</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </header>
  );
}
