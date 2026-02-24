import type { Metadata } from "next";
import "./globals.css";
import { EmotionRegistry } from "./emotion-registry";

export const metadata: Metadata = {
  title: "WhatsChat Admin",
  description: "WhatsChat admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}
