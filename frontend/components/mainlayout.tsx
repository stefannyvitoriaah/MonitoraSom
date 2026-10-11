"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./sidebar";

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

                <div className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center px-6">
                    <button onClick={alternarSidebar}
                    className="flex flex-col items-center justify-center gap-1 p-2">
                    <span className="w-5 h-0.5 bg-[#64748B]"></span>
                    <span className="w-5 h-0.5 bg-[#64748B]"></span>
                    <span className="w-5 h-0.5 bg-[#64748B]"></span>
                    </button>
                </div> 
              
                <main className="w-full h-[calc(100vh-4rem)] bg-[#F8FAFC] overflow-auto">
                    {children}
                </main>
                
            </div>
        </div>
    );
}