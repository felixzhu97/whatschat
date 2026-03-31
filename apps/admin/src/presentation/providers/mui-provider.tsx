"use client";

import { useMemo } from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useTheme as useAdminTheme } from "@/src/presentation/providers/theme-provider";
import { buildMuiTheme } from "@/src/shared/mui-theme";

export function MuiProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useAdminTheme();
  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
