# WhatsApp Actual Design Spec (2026 · Migration Reference)

This document is based on **WhatsApp official and published design evolution in 2025–2026**. It is for migrating WhatsChat toward real WhatsApp look and feel. It does **not** reference the current project implementation. Reference: **2026** stable and Beta (Material Design 3, white/black top bar).

## Principles (2024–2026 evolution)

- **Freshness** – Clearer, more modern UI
- **Approachability** – Simple, easy to use
- **Simplicity** – Conversations and contacts first; **green as accent only**, with neutral/white/black as base
- **Privacy & reliability** – Trust cues such as end-to-end encryption

From 2024, alignment with **Material Design 3 (Material You)**. In 2025–2026 the **top bar changed from green to white (light) / black (dark)**; green is used for app name, FAB, badges, links, and other accents—more restrained overall.

## Color (official / published · 2026)

### Light mode

| Use | Hex | Notes |
|-----|-----|--------|
| **Top bar (2026)** | #FFFFFF | Main app bar is white; no green bar. “WhatsApp” text in green |
| Brand dark (login/brand) | #075E54 | Deep Sea Green – still used for login, brand moments |
| Secondary green / accent | #128C7E | Surfie Green |
| Primary brand green | #25D366 | WhatsApp Green – title in bar, buttons, badges, links, FAB |
| Sent message bubble | #DCF8C6 or #25D366 | Gossip or brand green, by platform/theme |
| Received bubble | White / light gray | #FFFFFF with shadow or #E5E5EA-like gray |
| Chat background | #ECE5DD | Pearl Bush |
| Links / call etc. | #34B7F1 | Picton Blue |
| Primary text | #000000 | Black |
| Secondary text | #667781 or #8696A0 | Gray |

### Dark mode (2026: darker, higher contrast)

| Use | Hex | Notes |
|-----|-----|--------|
| **Top bar (2026)** | #000000 or #111B21 | Black or dark gray bar; title and icons white |
| Primary background | #111B21 | Main screen; not pure black |
| Surface / received bubble | #202C33 | App bar, cards, incoming bubble |
| Sent message bubble | #005C4B | Dark green; green appears brighter in dark mode |
| Primary text | #E9EDEF | Light gray-white |
| Secondary text | #8696A0 | Gray |
| Primary accent (links, notifications, FAB, ticks) | #00A884 | Bright green, more prominent |
| Status icons (sent/read ticks) | #53BDEB | Blue |

### Brand and utility

- Primary brand green: #25D366 (RGB 37, 211, 102)
- Dark teal (login/brand): #075E54 (RGB 7, 94, 84)
- Text on green: #FFFFFF

## Typography

- **Titles** – Bold, primary color, consistent in headers and lists
- **Body** – Regular weight, line-height ~1.4–1.5
- **Supporting** – Smaller, secondary color for timestamps, status, captions
- System sans-serif (e.g. SF Pro, Roboto)

## Layout & navigation (2026)

- **Top bar** – Light: white background, green “WhatsApp” title. Dark: black/dark gray background, white text. Call, camera, menu as **outline icons**.
- **Status** – Status entry in or near the top app bar for quick access from Chats without switching tab.
- **Bottom navigation** – Android and iOS both use bottom tabs (Chats, Calls, Status, etc.).
- **Chat list** – Search bar fixed at top of Chats tab.
- **Attachments / media** – Expandable attachment tray (e.g. iOS), not full-screen modal.
- **Settings** – Multiple entry points (e.g. app bar menu, profile) for discoverability.
- **Spacing** – More whitespace and consistent spacing.

## Core components (2026)

### Message bubble

- **Sent** – Green fill (light: #DCF8C6 or #25D366; dark: #005C4B), white or dark text for contrast, right-aligned, optional tail.
- **Received** – Light: white/light gray; dark: #202C33.
- Corner radius ~8–12px; max width ~75% of viewport.
- Time and status (✓ ✓✓) at bottom-right inside bubble; ticks #53BDEB in dark.
- **Themes (2026 Beta)** – Some builds allow chat theme and bubble color customization; migration can reserve extension.

### List item (chat / contact)

- Left: avatar, optional online green dot (#25D366 / #00A884).
- Center: title + last message preview in secondary color.
- Right: time; unread as green dot or count badge (#25D366 / #00A884, white text).
- Dividers in neutral gray.

### Top bar and primary button (2026)

- **Top bar** – Light #FFFFFF, dark #000000 or #111B21; title and icons black/white, brand name in green.
- **FAB / primary button** – #25D366 (light) or #00A884 (dark); **green is brighter in dark mode in 2026**, white icon/text.
- Hover/pressed: slightly darker, e.g. #128C7E or #075E54.

### Input area

- **Input** – Light: white/light gray; dark: surface tone like #2A3942; rounded; placeholder in secondary color.
- **Send** – Green circle or rounded rect, #25D366 / #00A884, white icon.
- Attachments, emoji, mic on the left; **icons in outline style**.

## Icons and illustration (2026)

- **Outline icons** – Voice call, video call, camera use outline style, aligned with Material Design 3.
- Primary and selected states use brand green or #00A884 (dark).
- Illustrations rounded, consistent stroke, optional green accent.

## Dark mode (2026)

- Backgrounds #111B21, #202C33; avoid pure #000000 where it causes strain or OLED smearing; top bar can be black or #111B21.
- Green accents (#00A884, #005C4B) are brighter and more visible in dark mode.
- Maintain contrast and accessibility (WCAG).

## Customization and themes (2026 Beta)

- **App icons** – Multiple icon options (Beta ~14).
- **Theme / color** – ~19 color options for accent/brand (Beta).
- **Chat themes** – Bubble color, chat background/wallpaper (some builds).
- Migration can reserve theme and palette extension; defaults should follow the official colors above.

## References

- [WhatsApp new look (FAQ)](https://faq.whatsapp.com/3181431452166375/) (official)
- [WhatsApp Color Palette – Design Pieces](https://www.designpieces.com/palette/whatsapp-color-palette-hex-and-rgb/) – light brand colors
- [WhatsApp Dark Mode Palette – InspireTips](https://inspiretips.blog/whatsapp-dark-mode-palette-official-hex-codes-38439/) – dark mode hex codes
- [Meta WhatsApp Brand Resources](https://about.meta.com/brand/resources/whatsapp/whatsapp-brand) – trademark and brand usage
- 2025–2026 coverage and Beta: Gadgets 360, WABetaInfo, Android Police, Nokia Power User (white/black top bar, Material Design 3, Status in app bar, icon and theme customization)

When migrating, rely on the official WhatsApp app and the sources above; this doc is a 2026 summary reference.

English | [中文](../../zh/product/whatsapp-design-style.md)
