import type { Metadata } from "next";
import "./globals.css";
import { GrowthBookProviderWrapper } from "@/presentation/providers/growthbook-provider";

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
      <body>
        <GrowthBookProviderWrapper>{children}</GrowthBookProviderWrapper>
      </body>
    </html>
  );
}
