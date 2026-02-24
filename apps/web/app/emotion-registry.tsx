"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

/**
 * Emotion cache for App Router: injects critical CSS during SSR.
 * Use styled() or css prop in client components for optimal styles.
 */
export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: "css", prepend: true });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(" "),
        }}
      />
    );
  });

  if (typeof window !== "undefined") return <>{children}</>;
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
