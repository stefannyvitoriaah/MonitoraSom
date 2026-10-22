"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./sidebar";
import AddAudioButton from "@/components/addaudio";

interface MainLayoutProps{
    children: ReactNode;
}

export default function MainLayout({children}: MainLayoutProps){
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [animar, setAnimar] = useState(false);

    useEffect(() =>{
        function verificarTamanhoDaTela(){
                setAnimar(false);
            if (window.innerWidth < 1024){
                setSidebarAberta(false);}
        }

    window.addEventListener("resize", verificarTamanhoDaTela);

    return () =>{
        window.removeEventListener("resize", verificarTamanhoDaTela);
        };
    }, []);

    function alternarSidebar(){
        setAnimar(true);
        setSidebarAberta((aberta) => !aberta);} 

    function fecharSidebar(){
        setAnimar(true);
        setSidebarAberta(false);}

    return(
        <div className="flex h-screen overflow-hidden">

            <Sidebar
                aberta={sidebarAberta}
                animar={animar}/>

            {sidebarAberta &&(
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={fecharSidebar} 
                /> 
            )}

            <div className="flex-1 min-w-0">

                <div className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        {/* Botão corrigido para alinhar as linhas corretamente */}
                        <button onClick={alternarSidebar}
                        className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="w-5 h-0.5 bg-[#64748B] rounded-full"></span>
                            <span className="w-5 h-0.5 bg-[#64748B] rounded-full"></span>
                            <span className="w-5 h-0.5 bg-[#64748B] rounded-full"></span>
                        </button>
                            <span className="text-[17px] font-medium text-[#64748B] translate-y-0.5">
                                Rotulação
                            </span>
                    </div>

                    <AddAudioButton />
                </div> 
              
                <main className="w-full h-[calc(100vh-4rem)] bg-[#F8FAFC] overflow-auto">
                    {children}
                </main>
                
            </div>
        </div>
    );
}