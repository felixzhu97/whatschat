import "@emotion/react";
import type { ThemeColors, Typography } from "./presentation/shared/theme/AppTheme";

declare module "@emotion/react" {
  export interface Theme {
    colors: ThemeColors;
    typography: Typography;
    isDark: boolean;
  }
}
