// components/client-wrapper.tsx
"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import ToastMessage from "@/features/ui/toast-message";
import MainSidebar from "@/components/main-sidebar/main-sidebar";
import ClientHydrator from "@/components/client-hydrator";
import ChangelogModal from "@/components/changelog-modal";

export default function ClientWrapper({
  userProfile,
  children,
}: {
  userProfile: any;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ClientHydrator userProfile={userProfile} />
      <ChangelogModal />
      <Toaster />
      <ToastMessage />

      <MainSidebar />
      {children}
    </ThemeProvider>
  );
}
