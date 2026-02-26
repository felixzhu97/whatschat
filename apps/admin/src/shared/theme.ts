export type ThemeMode = "light" | "dark";

export const primaryHex = "#25d366";

export const theme = {
  bg: "var(--admin-bg)",
  surface: "var(--admin-surface)",
  surfaceAlt: "var(--admin-surface-alt)",
  border: "var(--admin-border)",
  borderLight: "var(--admin-border-light)",
  text: "var(--admin-text)",
  textSecondary: "var(--admin-text-secondary)",
  primary: "var(--admin-primary)",
  primaryHover: "var(--admin-primary-hover)",
  danger: "var(--admin-danger)",
  dangerHover: "var(--admin-danger-hover)",
  inputBg: "var(--admin-input-bg)",
  chartGrid: "var(--admin-chart-grid)",
  iconMuted: "var(--admin-icon-muted)",
  shadow: "var(--admin-shadow)",
} as const;

export const lightColors = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  border: "#e9edef",
  text: "#111b21",
  textSecondary: "#667781",
  primary: "#25d366",
} as const;

export const darkColors = {
  bg: "#0b141a",
  surface: "#1f2c34",
  border: "#2a3942",
  text: "#e9edef",
  textSecondary: "#8696a0",
  primary: "#25d366",
} as const;
