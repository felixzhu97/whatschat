"use client";

import { createTheme } from "@mui/material/styles";
import type { ThemeMode } from "@/src/shared/theme";

export function buildMuiTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#4cb5f9" : "#0095f6",
      },
      background: {
        default: isDark ? "#000000" : "#fafafa",
        paper: isDark ? "#121212" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f5f5f5" : "#262626",
        secondary: isDark ? "#a8a8a8" : "#8e8e8e",
      },
      divider: isDark ? "#2f2f2f" : "#dbdbdb",
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            border: `1px solid ${isDark ? "#2f2f2f" : "#dbdbdb"}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
    },
  });
}
