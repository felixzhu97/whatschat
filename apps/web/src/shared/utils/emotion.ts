import styled from "@emotion/styled";
import { keyframes, useTheme, css } from "@emotion/react";

export const whatsappListRowColors = {
  default: "transparent",
  selected: "rgb(243 244 246)",
  active: "rgb(239 246 255)",
  hover: "rgb(249 250 251)",
} as const;

export const whatsappShadows = {
  listRowActive: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
} as const;

export { styled, keyframes, css, useTheme };
