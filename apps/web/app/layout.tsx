import type { Metadata } from "next";
import "./globals.css";
import { EmotionRegistry } from "./emotion-registry";
import { I18nProvider } from "@/presentation/providers/i18n-provider";
import { GrowthBookProviderWrapper } from "@/presentation/providers/growthbook-provider";
import { AnalyticsProvider } from "@/presentation/providers/analytics-provider";
import { StoreProvider } from "@/presentation/providers/StoreProvider";

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
        <EmotionRegistry>
          <StoreProvider>
            <I18nProvider>
              <GrowthBookProviderWrapper>
                <AnalyticsProvider>{children}</AnalyticsProvider>
              </GrowthBookProviderWrapper>
            </I18nProvider>
          </StoreProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
