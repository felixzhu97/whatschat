import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "whats chat",
  description: "whats chat is a chat app",
  generator: "whats chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
