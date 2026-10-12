"use client";

interface SidebarProps{
    aberta: boolean;
    animar: boolean;
}

export default function Sidebar({ aberta, animar }: SidebarProps){
    return(
        <aside
            className={`
                bg-[#FFFFFF]
                border-r border-[#E2E8F0]

                lg:relative
                lg:min-h-screen
                lg:translate-x-0

                ${aberta ? "w-65" : "w-20"}

                ${animar
                    ? "lg:transition-[width] lg:duration-300 lg:ease-in-out max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out"
                    : "" }
                    
                max-lg:fixed
                max-lg:inset-y-0
                max-lg:left-0
                max-lg:z-50
                max-lg:w-65
                max-lg:transform

                ${aberta
                    ? "max-lg:translate-x-0"
                    : "max-lg:-translate-x-full"}
            `}>

            <div className="flex flex-col h-full">
                <div className="h-28 flex items-center justify-center px-4">
                    {aberta ? (
                        <img
                            src="/logoBarAberto.svg"
                            alt="Logo"
                            className="h-25 w-auto translate-y-3"/>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1 pt-4">
                            <img
                                src="/logoBar.svg"
                                alt="Logo"
                                className="h-14 w-auto"/>
                            <button 
                                className="p-2 w-[55px] flex items-center justify-center rounded-xl bg-cyan-800/10 border hover:bg-cyan-700/20 transition-all group mt-2"
                                title="Rotulação (Página Principal)">
                                <img
                                    src="/frequencia-azul.svg"
                                    alt="Frequência Ativa"
                                    className="h-6 w-auto text-[#06B6D4]"/>
                            </button>
                        </div>
                    )}
                </div>

                {aberta && (
                    <div className="flex flex-col px-4 py-4 gap-3 mt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 tracking-wider px-2">
                            <span>ANOTAÇÃO</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <button 
                            className="px-2 py-3 w-[223px] flex items-center justify-start gap-2 rounded-xl bg-cyan-800/10 border hover:bg-cyan-700/20 transition-all group mt-0"
                            title="Rotulação (Página Principal)">
                            <img 
                            src="/frequencia-azul.svg"
                            alt="Rotulação" 
                            className="h-5 w-5 text-[#06B6D4]" />

                            <span className="font-semibold text-[#4F46E5]">Rotulação</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>);
}