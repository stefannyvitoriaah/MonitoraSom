"use client";

import { ReactNode, useEffect } from "react";
import { useLayoutShell } from "@/contexts/LayoutContext";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function MainLayout({
  children,
  title = "Rotulação",
}: MainLayoutProps) {
  const { setPageTitle } = useLayoutShell();

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  return <>{children}</>;
}