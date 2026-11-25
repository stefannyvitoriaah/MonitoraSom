"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  aberta: boolean;
  animar: boolean;
}

export default function Sidebar({ aberta, animar }: SidebarProps) {
  const pathname = usePathname();
  const isRotulacao = pathname === "/" || pathname.startsWith("/rotulacao");
  const isHistorico = pathname.startsWith("/historico");
  const isConfiguracoes = pathname.startsWith("/configuracoes");

  return (
    <aside
      className={`
        bg-[#FFFFFF]
        border-r border-[#E2E8F0]

        lg:relative
        lg:min-h-screen
        lg:translate-x-0

        ${aberta ? "w-65" : "w-20"}

        ${
          animar
            ? "lg:transition-[width] lg:duration-300 lg:ease-in-out max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out"
            : ""
        }

        max-lg:fixed
        max-lg:inset-y-0
        max-lg:left-0
        max-lg:z-50
        max-lg:w-65
        max-lg:transform

        ${aberta ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="h-28 flex items-center justify-center px-4">
          {aberta ? (
            <img
              src="/logoBarAberto.svg"
              alt="Logo"
              className="h-25 w-auto translate-y-3"
            />
          ) : (
            <img
              src="/logoBar.svg"
              alt="Logo"
              className="h-14 w-auto pt-2"
            />
          )}
        </div>

        {aberta ? (
          <nav className="flex flex-col px-4 py-4 gap-5 mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 tracking-wider px-2">
                <span>ANOTAÇÃO</span>
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <Link
                href="/"
                title="Rotulação (Página Principal)"
                className={`px-3 py-3 w-full flex items-center justify-start gap-2.5 rounded-xl border transition-all ${
                  isRotulacao
                    ? "bg-cyan-800/10 border-cyan-600/20 text-[#4F46E5] font-semibold hover:bg-cyan-700/20"
                    : "bg-transparent border-transparent text-[#64748B] font-medium hover:bg-slate-100"
                }`}
              >
                <img
                  src="/frequencia-azul.svg"
                  alt="Rotulação"
                  className="h-5 w-5"
                />
                <span>Rotulação</span>
              </Link>

              <Link
                href="/historico"
                title="Histórico de Áudios"
                className={`px-3 py-3 w-full flex items-center justify-start gap-2.5 rounded-xl border transition-all ${
                  isHistorico
                    ? "bg-cyan-800/10 border-cyan-600/20 text-[#4F46E5] font-semibold hover:bg-cyan-700/20"
                    : "bg-transparent border-transparent text-[#64748B] font-medium hover:bg-slate-100"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    isHistorico ? "text-[#4F46E5]" : "text-[#64748B]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Histórico</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 tracking-wider px-2">
                <span>SISTEMA</span>
              </div>

              <Link
                href="/configuracoes"
                title="Configurações Gerais"
                className={`px-3 py-3 w-full flex items-center justify-start gap-2.5 rounded-xl border transition-all ${
                  isConfiguracoes
                    ? "bg-cyan-800/10 border-cyan-600/20 text-[#4F46E5] font-semibold hover:bg-cyan-700/20"
                    : "bg-transparent border-transparent text-[#64748B] font-medium hover:bg-slate-100"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    isConfiguracoes ? "text-[#4F46E5]" : "text-[#64748B]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Configurações</span>
              </Link>
            </div>
          </nav>
        ) : (
          <nav className="flex flex-col items-center gap-3 px-2 mt-2">
            <Link
              href="/"
              title="Rotulação (Página Principal)"
              className={`p-2.5 w-12 h-11 flex items-center justify-center rounded-xl border transition-all ${
                isRotulacao
                  ? "bg-cyan-800/10 border-cyan-600/20 hover:bg-cyan-700/20"
                  : "bg-transparent border-transparent hover:bg-slate-100"
              }`}
            >
              <img
                src="/frequencia-azul.svg"
                alt="Rotulação"
                className="h-6 w-auto"
              />
            </Link>

            <Link
              href="/historico"
              title="Histórico de Áudios"
              className={`p-2.5 w-12 h-11 flex items-center justify-center rounded-xl border transition-all ${
                isHistorico
                  ? "bg-cyan-800/10 border-cyan-600/20 text-[#4F46E5] hover:bg-cyan-700/20"
                  : "bg-transparent border-transparent text-[#64748B] hover:bg-slate-100"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>

            <Link
              href="/configuracoes"
              title="Configurações Gerais"
              className={`p-2.5 w-12 h-11 flex items-center justify-center rounded-xl border transition-all ${
                isConfiguracoes
                  ? "bg-cyan-800/10 border-cyan-600/20 text-[#4F46E5] hover:bg-cyan-700/20"
                  : "bg-transparent border-transparent text-[#64748B] hover:bg-slate-100"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </nav>
        )}
      </div>
    </aside>
  );
}