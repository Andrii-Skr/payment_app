// components/SidebarButton.tsx
"use client";

interface Props {
  active: boolean;
  onClick: () => void;
  label: string;
}

export default function SidebarButton({ active, onClick, label }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-4 py-2 text-left transition
        ${active ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
    >
      {label}
    </button>
  );
}
