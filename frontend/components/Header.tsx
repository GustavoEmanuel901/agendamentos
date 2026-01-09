import Image from "next/image";
import Link from "next/link";

interface SidebarProps {
  buttonLabel: string;
  route?: string;
}

export default function Sidebar({ buttonLabel, route }: SidebarProps) {
  return (
    <header className="flex p-5 items-center justify-between border-b border-gray-200">
      <Image src="/Group.svg" alt="logo" width={40} height={40} />
      <Link
        aria-label="action"
        className="bg-black ml-4 px-6 py-2 border rounded-md text-sm font-medium 
        text-white hover:bg-gray-700 transition duration-200"
        href={route || "/register"}
      >
        {buttonLabel}
      </Link>
    </header>
  );
}
