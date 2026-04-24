import React from "react";
import { Plus } from "lucide-react";

export default function AddHouseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
    >
      <Plus size={16} />
      Thêm
    </button>
  );
}