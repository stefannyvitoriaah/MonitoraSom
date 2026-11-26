"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  aberta: boolean;
  animar: boolean;
}

interface PillMetrics {
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
}

type NavKey = "rotulacao" | "historico" | "configuracoes";

export default function Sidebar({ aberta, animar }: SidebarProps) {
  const pathname = usePathname();

  const activeKey: NavKey | null =
    pathname === "/" || pathname.startsWith("/rotulacao")
      ? "rotulacao"
      : pathname.startsWith("/historico")
        ? "historico"
        : pathname.startsWith("/configuracoes")
          ? "configuracoes"
          : null;

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<NavKey, HTMLAnchorElement | null>>({
    rotulacao: null,
    historico: null,
    configuracoes: null,
  });

  const [pill, setPill] = useState<PillMetrics>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    visible: false,
  });
  const [isMoving, setIsMoving] = useState(false);
  const prevKeyRef = useRef<NavKey | null>(activeKey);

  const measurePill = useCallback(() => {
    const navEl = navRef.current;
    const activeEl = activeKey ? itemRefs.current[activeKey] : null;

    if (!navEl || !activeEl) {
      setPill((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    setPill({
      top: activeRect.top - navRect.top,
      left: activeRect.left - navRect.left,
      width: activeRect.width,
      height: activeRect.height,
      visible: true,
    });
  }, [activeKey]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill, aberta]);

  useEffect(() => {
    if (prevKeyRef.current !== activeKey && activeKey !== null) {
      setIsMoving(true);
      const timer = window.setTimeout(() => setIsMoving(false), 460);
      prevKeyRef.current = activeKey;
      return () => window.clearTimeout(timer);
    }
    prevKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      measurePill();
    });
    observer.observe(navEl);

    const rafId = window.requestAnimationFrame(measurePill);
    const settleTimer = window.setTimeout(measurePill, 360);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
    };
  }, [measurePill, aberta]);

  const getItemClasses = (isActive: boolean) =>
    `relative z-10 flex items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
      aberta
        ? "w-full px-3.5 py-3 justify-start gap-3"
        : "w-12 h-11 mx-auto justify-center p-2.5"
    } ${
      isActive
        ? "text-[#4F46E5] font-semibold"
        : "text-[#64748B] font-medium hover:text-slate-900 hover:bg-white/55"
    }`;

  return (
    <aside
      onTransitionEnd={measurePill}
      className={`
        liquid-glass-sidebar
        relative z-50 shrink-0 select-none

        lg:relative
        lg:min-h-screen
        lg:translate-x-0

        ${aberta ? "w-65" : "w-20"}

        ${
          animar
            ? "lg:transition-[width] lg:duration-350 lg:ease-[cubic-bezier(0.22,1,0.36,1)] max-lg:transition-transform max-lg:duration-350 max-lg:ease-[cubic-bezier(0.22,1,0.36,1)]"
            : ""
        }

        max-lg:fixed
        max-lg:inset-y-0
        max-lg:left-0
        max-lg:w-65
        max-lg:transform

        ${aberta ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="h-28 flex items-center justify-center px-4 overflow-hidden">
          {aberta ? (
            <img
              src="/logoBarAberto.svg"
              alt="Logo MonitoraSom"
              className="h-25 w-auto translate-y-3 transition-all duration-300"
            />
          ) : (
            <img
              src="/logoBar.svg"
              alt="Logo MonitoraSom"
              className="h-14 w-auto pt-2 transition-all duration-300"
            />
          )}
        </div>

        <nav
          ref={navRef}
          className={`relative flex flex-col mt-2 ${
            aberta ? "px-4 py-4 gap-5" : "px-2 py-2 gap-3"
          }`}
        >
          {/* Cápsula flutuante de Liquid Glass perfeitamente centralizada */}
          <div
            aria-hidden="true"
            className={`liquid-glass-pill top-0 left-0 ${
              isMoving ? "liquid-glass-pill-moving" : ""
            }`}
            style={{
              top: 0,
              left: 0,
              opacity: pill.visible ? 1 : 0,
              width: `${pill.width}px`,
              height: `${pill.height}px`,
              transform: `translate3d(${pill.left}px, ${pill.top}px, 0) ${
                isMoving ? "scale(0.985, 1.045)" : "scale(1, 1)"
              }`,
            }}
          />

          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider px-2 transition-all duration-300 overflow-hidden ${
                aberta ? "max-h-6 opacity-100 mb-0.5" : "max-h-0 opacity-0"
              }`}
            >
              <span>ANOTAÇÃO</span>
              <svg
                className="w-3 h-3 text-slate-400"
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
              ref={(el) => {
                itemRefs.current.rotulacao = el;
              }}
              href="/"
              title="Rotulação (Página Principal)"
              className={getItemClasses(activeKey === "rotulacao")}
            >
              <img
                src="/frequencia-azul.svg"
                alt="Rotulação"
                className={`shrink-0 transition-transform duration-300 ${
                  aberta ? "h-5 w-5" : "h-6 w-auto"
                } ${activeKey === "rotulacao" ? "scale-105" : ""}`}
              />
              {aberta && <span className="truncate">Rotulação</span>}
            </Link>

            <Link
              ref={(el) => {
                itemRefs.current.historico = el;
              }}
              href="/historico"
              title="Histórico de Áudios"
              className={getItemClasses(activeKey === "historico")}
            >
              <svg
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  activeKey === "historico"
                    ? "text-[#4F46E5] scale-105"
                    : "text-[#64748B]"
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
              {aberta && <span className="truncate">Histórico</span>}
            </Link>
          </div>

          {!aberta && (
            <div className="w-8 h-px mx-auto bg-slate-200/80 rounded-full" />
          )}

          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider px-2 transition-all duration-300 overflow-hidden ${
                aberta ? "max-h-6 opacity-100 mb-0.5" : "max-h-0 opacity-0"
              }`}
            >
              <span>SISTEMA</span>
            </div>

            <Link
              ref={(el) => {
                itemRefs.current.configuracoes = el;
              }}
              href="/configuracoes"
              title="Configurações Gerais"
              className={getItemClasses(activeKey === "configuracoes")}
            >
              <svg
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  activeKey === "configuracoes"
                    ? "text-[#4F46E5] rotate-45"
                    : "text-[#64748B]"
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
              {aberta && <span className="truncate">Configurações</span>}
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}