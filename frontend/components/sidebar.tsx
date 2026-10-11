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

            <div className="h-20 flex items-center justify-center">

                {aberta ? (
                    <img
                        src= "/logoBarAberto.svg"
                        alt="Logo"
                        className="h-25 w-auto translate-y-5"/>
                ) : (
                    <img
                        src="/logoBar.svg"
                        alt="Logo"
                        className="h-16 w-auto translate-y-1"/>
                )}
            </div>
        </aside>
    );
}