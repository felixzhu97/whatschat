"use client";

import "@/src/shared/i18n";
import { ThemeProvider } from "@/src/presentation/providers/theme-provider";
import { AuthProvider } from "@/src/presentation/providers/auth-provider";
import { MuiProvider } from "@/src/presentation/providers/mui-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MuiProvider>
        <AuthProvider>{children}</AuthProvider>
      </MuiProvider>
    </ThemeProvider>
  );
}
