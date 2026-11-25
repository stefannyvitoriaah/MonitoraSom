"use client";

import { useState } from "react";
import MainLayout from "@/components/mainlayout";
import HistoricoLista from "@/components/HistoricoLista";

export default function HistoricoPage() {
  const [total, setTotal] = useState(0);

  return (
    <MainLayout title="Histórico">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              Histórico de Áudios
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Todos os áudios enviados e processados, com seus rótulos e ações
              rápidas.
            </p>
          </div>

          <span className="shrink-0 px-3 py-1 text-xs font-semibold text-[#4F46E5] bg-indigo-50 border border-indigo-100 rounded-lg">
            {total} {total === 1 ? "áudio" : "áudios"}
          </span>
        </div>

        <HistoricoLista onTotalChange={setTotal} />
      </div>
    </MainLayout>
  );
}