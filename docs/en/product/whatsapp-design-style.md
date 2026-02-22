# WhatsApp-Style Design Guidelines

This document describes the WhatsApp-inspired UI/UX design style used by WhatsChat for Web, mobile, and design deliverables.

## Principles

- **Simplicity** – Interface centers on conversations and contacts with minimal clutter
- **Trust** – Green primary color and trust cues (e.g. end-to-end encryption)
- **Consistency** – Unified navigation, bubbles, and icon style across platforms

## Color

### Primary

| Use | Hex | Notes |
|-----|-----|--------|
| Primary green (buttons, bubbles, accent) | `#1DAC5A` | Sent bubble, primary button, unread badge, links |
| Dark green (header / login) | `#128C7E` | Login/register header, brand dark background |
| Light green (accent, online) | `#25D366` | WhatsApp brand green, optional accent |

### Bubbles & Backgrounds

| Context | Light | Dark |
|---------|-------|------|
| Sent message bubble | `#1DAC5A` | `#1DAC5A` |
| Received bubble | `#E5E5EA` | `#3A3A3C` |
| Chat background | `#F2F2F7` | `#000000` |
| Secondary (header, list) | `#FFFFFF` | `#1C1C1E` |

### Text & Dividers

| Use | Light | Dark |
|-----|-------|------|
| Primary text | `#000000` | `#FFFFFF` |
| Secondary / caption | `#8E8E93` | `#8E8E93` |
| Separator | `#C6C6C8` | `#38383A` |

### Status & System

- Online / delivered: green `#34C759` or primary green
- Read: blue `#007AFF`
- Unread badge: red `#FF3B30`

## Typography

- **Titles** – Bold, primary color, consistent in headers and lists
- **Body** – Regular weight, line-height ~1.4–1.5
- **Supporting** – Smaller, secondary color for timestamps, status, captions
- Prefer system sans-serif (e.g. SF Pro, Roboto)

## Layout & Navigation

- **Mobile** – Bottom tabs (chats, contacts, settings); fixed header with title and actions
- **Chat list** – Search at top; list items: avatar + name/preview/time; unread badge in primary green
- **Chat detail** – Header with contact and actions; fixed input at bottom; message bubbles in between
- **Spacing** – Adequate padding in lists and around bubbles

## Core Components

### Message bubble

- **Sent** – Primary green background, white text, right-aligned, optional tail
- **Received** – Gray background, dark text, left-aligned, optional avatar
- Corner radius ~8–18px; max width ~75% of viewport
- Time and status (✓ ✓✓) at bottom-right inside bubble, small, subtle

### List item (chat / contact)

- Left: avatar (optional online green dot)
- Center: title + subtitle/last message preview
- Right: time or unread count badge (primary green, white text)
- Tap state and dividers follow platform conventions

### Primary button & FAB

- Primary action: primary green background, white text, rounded
- New-chat FAB: primary green circle, white plus icon
- Hover/pressed: slightly darker green (e.g. `#128C7E` or 5% darker)

### Input area

- Input: white/dark background, rounded, placeholder in secondary color
- Send: primary green circle or rounded rectangle, icon or “Send” label
- Attachments/emoji on the left of the input, consistent icon set

## Icons & Illustration

- Line or light fill, rounded, consistent stroke weight
- Primary and selected states use primary green
- Empty states can use primary green as accent

## Dark mode

- Use dark gray/black for background and cards; avoid pure white
- Keep primary green for bubbles and buttons; tweak brightness for contrast if needed
- Use dark gray for dividers and borders while keeping text readable

## Implementation

- **Web** – Tailwind e.g. `bg-green-500`, `text-white` map to primary green and white
- **Mobile** – `AppTheme` `primaryGreen`, `primaryGreenDark`, `myMessageBubble`, etc. match the table above
- Prefer theme tokens for new components; avoid hard-coded hex where possible

## References

- [WhatsApp new look (FAQ)](https://faq.whatsapp.com/3181431452166375/) (2024)
- In repo: `apps/mobile/src/presentation/shared/theme/AppTheme.ts`, `apps/web` component styles

English | [中文](../../zh/product/whatsapp-design-style.md)
