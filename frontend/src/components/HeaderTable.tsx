interface HeaderTableProps {
  title: string;
  subtitle: string;
}

export default function HeaderTable({ title, subtitle }: HeaderTableProps) {
  return (
    <header className="w-full flex flex-col p-5 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </header>
  );
}
