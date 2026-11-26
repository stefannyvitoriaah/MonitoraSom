"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import AddAudioButton from "@/components/addaudio";
import {
  GlassButton,
  LiquidGlassSvgFilters,
} from "@/components/expo-glass-effect";

interface LayoutContextValue {
  hasPersistentShell: boolean;
  sidebarAberta: boolean;
  setPageTitle: (title: string) => void;
  alternarSidebar: () => void;
  fecharSidebar: () => void;
}

const SIDEBAR_STORAGE_KEY = "monitorasom:sidebar-open";

const LayoutContext = createContext<LayoutContextValue>({
  hasPersistentShell: false,
  sidebarAberta: false,
  setPageTitle: () => {},
  alternarSidebar: () => {},
  fecharSidebar: () => {},
});

function getDefaultTitle(pathname: string): string {
  if (pathname.startsWith("/historico")) return "Histórico";
  if (pathname.startsWith("/configuracoes")) return "Configurações Gerais";
  if (pathname.startsWith("/download")) return "Download";
  if (pathname.startsWith("/upload")) return "Upload";
  if (pathname.startsWith("/modificacao")) return "Modificação";
  return "Rotulação";
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [animar, setAnimar] = useState(false);
  const [customTitle, setCustomTitle] = useState<{
    path: string;
    value: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Restaura o estado da barra no desktop e preserva o comportamento responsivo no resize
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true" && window.innerWidth >= 1024) {
        setSidebarAberta(true);
      }
    } catch {
      // ignora erro de acesso ao localStorage
    }

    function verificarTamanhoDaTela() {
      setAnimar(false);
      if (window.innerWidth < 1024) {
        setSidebarAberta(false);
      }
    }

    window.addEventListener("resize", verificarTamanhoDaTela);
    return () => {
      window.removeEventListener("resize", verificarTamanhoDaTela);
    };
  }, []);

  // Dispara o feixe líquido na barra superior ao trocar de rota
  useEffect(() => {
    setIsNavigating(true);
    const timer = window.setTimeout(() => setIsNavigating(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const alternarSidebar = useCallback(() => {
    setAnimar(true);
    setSidebarAberta((aberta) => {
      const next = !aberta;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignora erro de gravação
      }
      return next;
    });
  }, []);

  const fecharSidebar = useCallback(() => {
    setAnimar(true);
    setSidebarAberta(false);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
    } catch {
      // ignora erro de gravação
    }
  }, []);

  const setPageTitle = useCallback(
    (title: string) => {
      setCustomTitle({ path: pathname, value: title });
    },
    [pathname]
  );

  const currentTitle =
    customTitle?.path === pathname
      ? customTitle.value
      : getDefaultTitle(pathname);

  return (
    <LayoutContext.Provider
      value={{
        hasPersistentShell: true,
        sidebarAberta,
        setPageTitle,
        alternarSidebar,
        fecharSidebar,
      }}
    >
      <LiquidGlassSvgFilters />

      <div className="monitorasom-ambient-bg relative flex h-screen overflow-hidden">
        <Sidebar aberta={sidebarAberta} animar={animar} />

        {/* Backdrop apenas no mobile quando a sidebar estiver sobreposta */}
        <div
          onClick={fecharSidebar}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[3px] transition-opacity duration-300 lg:hidden ${
            sidebarAberta
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        <div className="relative flex flex-1 flex-col min-w-0">
          {/* Barra superior em Liquid Glass */}
          <header className="liquid-glass-bar relative z-30 h-16 shrink-0 flex items-center justify-between px-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <GlassButton
                type="button"
                variant="ghost"
                size="icon"
                onClick={alternarSidebar}
                aria-label="Alternar menu lateral"
                aria-expanded={sidebarAberta}
                className="shrink-0"
              >
                <span className="flex flex-col justify-center items-center w-5 h-5 gap-1.5">
                  <span
                    className={`h-0.5 bg-[#4F46E5] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      sidebarAberta ? "w-5" : "w-4"
                    }`}
                  />
                  <span className="w-5 h-0.5 bg-[#64748B] rounded-full transition-all duration-300" />
                  <span
                    className={`h-0.5 bg-[#06B6D4] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      sidebarAberta ? "w-3.5 self-start" : "w-5"
                    }`}
                  />
                </span>
              </GlassButton>

              <span
                key={currentTitle}
                className="liquid-title-enter text-[17px] font-semibold text-slate-700 tracking-tight truncate"
              >
                {currentTitle}
              </span>
            </div>

            <AddAudioButton
              onUploadSuccess={() =>
                window.dispatchEvent(new Event("audios:atualizados"))
              }
            />

            <div
              aria-hidden="true"
              className={`liquid-route-beam ${
                isNavigating ? "liquid-route-beam-active" : ""
              }`}
            />
          </header>

          {/* Conteúdo principal com transição fluida por rota */}
          <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
            <div key={pathname} className="liquid-page-enter min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}

export function useLayoutShell() {
  return useContext(LayoutContext);
}