"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Image as ImageIcon,
  Shield,
  Activity,
  BarChart2,
  Settings,
  Key,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Megaphone,
  Store,
  Tags,
  ShoppingBag,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { intersection } from "lodash";
import debounce from "lodash/debounce";
import { useAuth } from "@/src/presentation/providers/auth-provider";
import { useTheme } from "@/src/presentation/providers/theme-provider";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { setStoredLocale, type AppLocale } from "@/src/shared/i18n";

const NAV_STORAGE_KEY = "admin_nav_section_open";

const LayoutRoot = styled.div`
  display: flex;
  height: 100vh;
  background: ${theme.bg};
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 252px;
  height: 100vh;
  background: ${theme.surface};
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${theme.border};
  overflow-y: auto;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid ${theme.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.text};
`;

const NavLabel = styled.div`
  padding: 1rem 1.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: 0.75rem;
`;

const SectionHead = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  color: ${theme.textSecondary};
  &:hover {
    background: ${theme.surfaceAlt};
    color: ${theme.text};
  }
`;

const SectionHeadLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SubNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.25rem;
`;

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: ${(p) => (p.active ? theme.text : theme.textSecondary)};
  font-size: 0.9375rem;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  background: ${(p) => (p.active ? theme.surfaceAlt : "transparent")};
  text-decoration: none;
  &:hover {
    background: ${theme.surfaceAlt};
    color: ${theme.text};
  }
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${theme.border};
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${theme.surfaceAlt};
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${theme.text};
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: ${theme.textSecondary};
  font-size: 0.9375rem;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: ${theme.surfaceAlt};
    color: ${theme.danger};
  }
`;

const Main = styled.main`
  flex: 1;
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: ${theme.bg};
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: ${theme.surface};
  border-bottom: 1px solid ${theme.border};
  flex-shrink: 0;
`;

const TopBarLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 0;
`;

const BreadcrumbRow = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.35rem;
  font-size: 0.75rem;
  color: ${theme.textSecondary};
`;

const CrumbLink = styled(Link)`
  color: ${theme.textSecondary};
  text-decoration: none;
  &:hover {
    color: ${theme.primary};
  }
`;

const CrumbSep = styled.span`
  color: ${theme.iconMuted};
  user-select: none;
`;

const CrumbCurrent = styled.span`
  color: ${theme.text};
  font-weight: 500;
`;

const TopBarTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin: 0;
`;

const TopBarSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  margin: 0.25rem 0 0;
`;

const TopBarBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(37, 211, 102, 0.12);
  color: ${theme.primary};
  font-size: 0.75rem;
  font-weight: 600;
`;

const SearchTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  background: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  color: ${theme.textSecondary};
  font-size: 0.875rem;
  width: 240px;
  cursor: pointer;
  position: relative;
  text-align: left;
  &:hover {
    border-color: ${theme.textSecondary};
  }
`;

const SearchTriggerIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.iconMuted};
  display: flex;
`;

const SearchKbd = styled.span`
  margin-left: auto;
  font-size: 0.6875rem;
  font-weight: 500;
  color: ${theme.iconMuted};
  border: 1px solid ${theme.border};
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  background: ${theme.surface};
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${theme.iconMuted};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover {
    background: ${theme.surfaceAlt};
    color: ${theme.text};
  }
`;

const TopBarTools = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 1.5rem;
  & > * {
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
  }
`;

const LangSelect = styled.select`
  padding: 0.35rem 0.5rem;
  background: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 6px;
  color: ${theme.text};
  font-size: 0.8125rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23667781' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;
  padding-right: 1.5rem;
`;

const PaletteOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 20, 25, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 1rem;
`;

const PalettePanel = styled.div`
  width: min(520px, 100%);
  background: ${theme.surface};
  border-radius: 14px;
  border: 1px solid ${theme.border};
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;

const PaletteInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${theme.border};
`;

const PaletteInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: ${theme.text};
  font-size: 1rem;
  outline: none;
  &::placeholder {
    color: ${theme.textSecondary};
  }
`;

const PaletteList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  max-height: min(360px, 50vh);
  overflow-y: auto;
`;

const PaletteItem = styled.li<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${theme.text};
  background: ${(p) => (p.$active ? theme.surfaceAlt : "transparent")};
  &:hover {
    background: ${theme.surfaceAlt};
  }
`;

const PaletteItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
`;

const PaletteItemTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
`;

const PaletteItemSection = styled.span`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
`;

const PaletteEmpty = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: ${theme.textSecondary};
  font-size: 0.875rem;
`;

type NavItemConfig = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles?: string[];
};

type NavSectionConfig = {
  sectionKey: string;
  items: NavItemConfig[];
};

function itemVisibleForRoles(
  userRoles: string[] | undefined,
  item: NavItemConfig,
): boolean {
  if (userRoles == null) return true;
  if (!item.roles?.length) return true;
  return intersection(userRoles, item.roles).length > 0;
}

function filterNavSections(
  sections: NavSectionConfig[],
  userRoles: string[] | undefined,
): NavSectionConfig[] {
  return sections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => itemVisibleForRoles(userRoles, i)),
    }))
    .filter((s) => s.items.length > 0);
}

function buildDefaultSectionOpen(): Record<string, boolean> {
  return NAV_SECTIONS.reduce<Record<string, boolean>>((acc, s) => {
    acc[s.sectionKey] = true;
    return acc;
  }, {});
}

function getRouteKey(pathname: string): string {
  if (pathname === "/") return "dashboard.title";
  if (/^\/users\/[^/]+$/.test(pathname)) return "users.detailTitle";
  if (pathname.startsWith("/users")) return "users.title";
  if (/^\/chats\/[^/]+$/.test(pathname)) return "chats.detailTitle";
  if (pathname.startsWith("/groups")) return "groups.title";
  if (pathname.startsWith("/chats")) return "chats.title";
  if (pathname.startsWith("/posts")) return "posts.title";
  if (pathname.startsWith("/content-safety")) return "contentSafety.title";
  if (pathname.startsWith("/ops-monitor")) return "opsMonitor.title";
  if (pathname.startsWith("/business")) return "business.title";
  if (pathname.startsWith("/commerce/store")) return "commerce.storeTitle";
  if (pathname.startsWith("/commerce/tags")) return "commerce.tagsTitle";
  if (pathname.startsWith("/commerce/orders")) return "commerce.ordersTitle";
  if (pathname.startsWith("/commerce")) return "commerce.title";
  if (pathname.startsWith("/analytics")) return "analytics.title";
  if (pathname.startsWith("/ads/manager")) return "ads.moduleManager";
  if (pathname.startsWith("/ads/promote")) return "ads.modulePromote";
  if (pathname.startsWith("/ads/analytics")) return "ads.moduleAnalytics";
  if (pathname.startsWith("/ads")) return "ads.title";
  if (pathname.startsWith("/settings")) return "settings.title";
  if (pathname.startsWith("/permission")) return "permission.title";
  return "dashboard.title";
}

function getRouteSectionKey(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/analytics")) return "navSections.overview";
  if (
    pathname.startsWith("/users") ||
    pathname.startsWith("/groups") ||
    pathname.startsWith("/chats") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/content-safety")
  ) {
    return "navSections.contentAndCommunity";
  }
  if (pathname.startsWith("/ads")) return "navSections.commercialGrowth";
  if (pathname.startsWith("/commerce")) return "navSections.shoppingCommerce";
  if (pathname.startsWith("/ops-monitor") || pathname.startsWith("/settings") || pathname.startsWith("/permission")) {
    return "navSections.platformControl";
  }
  return "navSections.overview";
}

function getSubtitleKey(pathname: string): string {
  if (pathname === "/") return "dashboard.subtitle";
  if (/^\/users\/[^/]+$/.test(pathname)) return "users.detailSubtitle";
  if (pathname.startsWith("/users")) return "users.subtitle";
  if (/^\/chats\/[^/]+$/.test(pathname)) return "chats.detailSubtitle";
  if (pathname.startsWith("/groups")) return "groups.subtitle";
  if (pathname.startsWith("/chats")) return "chats.subtitle";
  if (pathname.startsWith("/posts")) return "posts.subtitle";
  if (pathname.startsWith("/content-safety")) return "contentSafety.subtitle";
  if (pathname.startsWith("/ops-monitor")) return "opsMonitor.subtitle";
  if (pathname.startsWith("/business")) return "business.subtitle";
  if (pathname.startsWith("/commerce/store")) return "commerce.storeSubtitle";
  if (pathname.startsWith("/commerce/tags")) return "commerce.tagsSubtitle";
  if (pathname.startsWith("/commerce/orders")) return "commerce.ordersSubtitle";
  if (pathname.startsWith("/commerce")) return "commerce.subtitle";
  if (pathname.startsWith("/analytics")) return "analytics.subtitle";
  if (pathname.startsWith("/ads/manager")) return "ads.managerSubtitle";
  if (pathname.startsWith("/ads/promote")) return "ads.promoteSubtitle";
  if (pathname.startsWith("/ads/analytics")) return "ads.analyticsSubtitle";
  if (pathname.startsWith("/ads")) return "ads.subtitle";
  if (pathname.startsWith("/settings")) return "settings.subtitle";
  if (pathname.startsWith("/permission")) return "permission.subtitle";
  return "dashboard.subtitle";
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    sectionKey: "navSections.overview",
    items: [
      { href: "/", labelKey: "dashboard.title", icon: LayoutDashboard },
      {
        href: "/analytics",
        labelKey: "analytics.title",
        icon: BarChart2,
        roles: ["admin", "analyst"],
      },
    ],
  },
  {
    sectionKey: "navSections.contentAndCommunity",
    items: [
      {
        href: "/users",
        labelKey: "users.title",
        icon: Users,
        roles: ["admin", "support", "moderator"],
      },
      {
        href: "/groups",
        labelKey: "groups.title",
        icon: UsersRound,
        roles: ["admin", "support", "moderator"],
      },
      {
        href: "/chats",
        labelKey: "chats.title",
        icon: MessageSquare,
        roles: ["admin", "support", "moderator"],
      },
      {
        href: "/posts",
        labelKey: "posts.title",
        icon: ImageIcon,
        roles: ["admin", "moderator"],
      },
      {
        href: "/content-safety",
        labelKey: "contentSafety.title",
        icon: Shield,
        roles: ["admin", "moderator"],
      },
    ],
  },
  {
    sectionKey: "navSections.commercialGrowth",
    items: [
      {
        href: "/ads/manager",
        labelKey: "ads.moduleManager",
        icon: Megaphone,
        roles: ["admin", "commercial"],
      },
      {
        href: "/ads/promote",
        labelKey: "ads.modulePromote",
        icon: ImageIcon,
        roles: ["admin", "commercial"],
      },
      {
        href: "/ads/analytics",
        labelKey: "ads.moduleAnalytics",
        icon: BarChart2,
        roles: ["admin", "commercial"],
      },
    ],
  },
  {
    sectionKey: "navSections.platformControl",
    items: [
      {
        href: "/ops-monitor",
        labelKey: "opsMonitor.title",
        icon: Activity,
        roles: ["admin", "ops"],
      },
      {
        href: "/settings",
        labelKey: "settings.title",
        icon: Settings,
        roles: ["admin"],
      },
      {
        href: "/permission",
        labelKey: "permission.title",
        icon: Key,
        roles: ["admin"],
      },
    ],
  },
  {
    sectionKey: "navSections.shoppingCommerce",
    items: [
      {
        href: "/commerce/store",
        labelKey: "commerce.storeTitle",
        icon: Store,
        roles: ["admin", "commercial"],
      },
      {
        href: "/commerce/tags",
        labelKey: "commerce.tagsTitle",
        icon: Tags,
        roles: ["admin", "commercial"],
      },
      {
        href: "/commerce/orders",
        labelKey: "commerce.ordersTitle",
        icon: ShoppingBag,
        roles: ["admin", "commercial"],
      },
    ],
  },
];

type PaletteRow = {
  href: string;
  labelKey: string;
  sectionKey: string;
  icon: LucideIcon;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userRoles = user?.roles;
  const visibleSections = useMemo(
    () => filterNavSections(NAV_SECTIONS, userRoles),
    [userRoles],
  );

  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>(
    buildDefaultSectionOpen,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(NAV_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setSectionOpen((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
    }
  }, []);

  const persistSectionOpen = useCallback((next: Record<string, boolean>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const toggleSection = useCallback(
    (key: string) => {
      setSectionOpen((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        persistSectionOpen(next);
        return next;
      });
    },
    [persistSectionOpen],
  );

  useEffect(() => {
    const sk = getRouteSectionKey(pathname);
    setSectionOpen((prev) => {
      if (prev[sk]) return prev;
      const next = { ...prev, [sk]: true };
      persistSectionOpen(next);
      return next;
    });
  }, [pathname, persistSectionOpen]);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteKeyword, setPaletteKeyword] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);

  const syncPaletteKeyword = useMemo(
    () =>
      debounce((next: string) => {
        setPaletteKeyword(next);
      }, 120),
    [],
  );

  useEffect(() => {
    syncPaletteKeyword(paletteQuery);
    return () => {
      syncPaletteKeyword.cancel();
    };
  }, [paletteQuery, syncPaletteKeyword]);

  const paletteRows: PaletteRow[] = useMemo(() => {
    const rows: PaletteRow[] = [];
    for (const section of visibleSections) {
      for (const item of section.items) {
        rows.push({
          href: item.href,
          labelKey: item.labelKey,
          sectionKey: section.sectionKey,
          icon: item.icon,
        });
      }
    }
    return rows;
  }, [visibleSections]);

  const filteredPaletteRows = useMemo(() => {
    const q = paletteKeyword.trim().toLowerCase();
    if (!q) return paletteRows;
    return paletteRows.filter((row) => {
      const title = t(row.labelKey).toLowerCase();
      const sec = t(row.sectionKey).toLowerCase();
      return title.includes(q) || sec.includes(q);
    });
  }, [paletteKeyword, paletteRows, t]);

  useEffect(() => {
    setPaletteIndex(0);
  }, [paletteQuery, paletteOpen]);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
  }, []);

  useEffect(() => {
    if (!paletteOpen) {
      setPaletteQuery("");
      setPaletteKeyword("");
    }
  }, [paletteOpen]);

  const goPaletteHref = useCallback(
    (href: string) => {
      closePalette();
      router.push(href);
    },
    [closePalette, router],
  );

  useEffect(() => {
    const open = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", open);
    return () => document.removeEventListener("keydown", open);
  }, []);

  useEffect(() => {
    if (!paletteOpen) return;
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPaletteIndex((i) =>
          Math.min(i + 1, Math.max(0, filteredPaletteRows.length - 1)),
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPaletteIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filteredPaletteRows[paletteIndex]) {
        e.preventDefault();
        goPaletteHref(filteredPaletteRows[paletteIndex].href);
      }
    };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, [
    paletteOpen,
    filteredPaletteRows,
    paletteIndex,
    closePalette,
    goPaletteHref,
  ]);

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const lng = e.target.value as AppLocale;
    setStoredLocale(lng);
    i18n.changeLanguage(lng);
  };

  const sectionKeyForPath = getRouteSectionKey(pathname);
  const pageTitleKey = getRouteKey(pathname);
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <LayoutRoot>
        <Main style={{ display: "flex", alignItems: "center", justifyContent: "center", color: theme.textSecondary }}>
          {t("common.loading")}
        </Main>
      </LayoutRoot>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <LayoutRoot>
      {paletteOpen ? (
        <PaletteOverlay
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePalette();
          }}
        >
          <PalettePanel role="dialog" aria-label={t("common.commandPalette")}>
            <PaletteInputRow>
              <Search size={20} color={theme.iconMuted} />
              <PaletteInput
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder={t("common.jumpToPlaceholder")}
              />
            </PaletteInputRow>
            {filteredPaletteRows.length === 0 ? (
              <PaletteEmpty>{t("common.noCommandResults")}</PaletteEmpty>
            ) : (
              <PaletteList>
                {filteredPaletteRows.map((row, idx) => (
                  <PaletteItem
                    key={`${row.href}-${row.sectionKey}`}
                    $active={idx === paletteIndex}
                    onMouseEnter={() => setPaletteIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goPaletteHref(row.href)}
                  >
                    <row.icon size={18} />
                    <PaletteItemMeta>
                      <PaletteItemTitle>{t(row.labelKey)}</PaletteItemTitle>
                      <PaletteItemSection>{t(row.sectionKey)}</PaletteItemSection>
                    </PaletteItemMeta>
                  </PaletteItem>
                ))}
              </PaletteList>
            )}
          </PalettePanel>
        </PaletteOverlay>
      ) : null}
      <Sidebar>
        <SidebarHeader>
          <Logo>
            <LogoIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </LogoIcon>
            <LogoText>WhatsChat Admin</LogoText>
          </Logo>
        </SidebarHeader>
        <NavLabel>{t("common.nav")}</NavLabel>
        <Nav>
          {visibleSections.map((section) => {
            const open = sectionOpen[section.sectionKey] !== false;
            return (
              <NavSection key={section.sectionKey}>
                <SectionHead
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleSection(section.sectionKey)}
                >
                  <SectionHeadLabel>{t(section.sectionKey)}</SectionHeadLabel>
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </SectionHead>
                {open ? (
                  <SubNav>
                    {section.items.map((r) => (
                      <NavLink
                        key={r.href}
                        href={r.href}
                        active={
                          pathname === r.href ||
                          (r.href !== "/" && pathname.startsWith(r.href))
                        }
                      >
                        <r.icon size={18} />
                        {t(r.labelKey)}
                      </NavLink>
                    ))}
                  </SubNav>
                ) : null}
              </NavSection>
            );
          })}
        </Nav>
        <SidebarFooter>
          <UserCard>
            <UserAvatar>
              {(user?.username || "A").charAt(0).toUpperCase()}
            </UserAvatar>
            <UserInfo>
              <UserName>{user?.username || "Admin"}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserInfo>
          </UserCard>
          <LogoutBtn onClick={logout}>
            <LogOut size={20} />
            {t("common.logout")}
          </LogoutBtn>
        </SidebarFooter>
      </Sidebar>
      <Main>
        <TopBar>
          <TopBarLeft>
            <BreadcrumbRow aria-label={t("common.breadcrumb")}>
              <CrumbLink href="/">{t("common.breadcrumbHome")}</CrumbLink>
              <CrumbSep aria-hidden>/</CrumbSep>
              <span>{t(sectionKeyForPath)}</span>
              <CrumbSep aria-hidden>/</CrumbSep>
              <CrumbCurrent>{t(pageTitleKey)}</CrumbCurrent>
            </BreadcrumbRow>
            <TopBarBadge>{t("common.adminLive")}</TopBarBadge>
            <TopBarTitle>{t(pageTitleKey)}</TopBarTitle>
            <TopBarSubtitle>
              {t(sectionKeyForPath)} · {t(getSubtitleKey(pathname))}
            </TopBarSubtitle>
          </TopBarLeft>
          <TopBarTools>
            <SearchTrigger type="button" onClick={() => setPaletteOpen(true)} aria-label={t("common.jumpTo")}>
              <SearchTriggerIcon>
                <Search size={18} />
              </SearchTriggerIcon>
              {t("common.jumpTo")}
              <SearchKbd>{isMac ? "⌘K" : "Ctrl+K"}</SearchKbd>
            </SearchTrigger>
            <IconBtn onClick={toggle} title={mode === "light" ? t("common.themeDark") : t("common.themeLight")}>
              {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </IconBtn>
            <LangSelect value={i18n.language.startsWith("zh") ? "zh" : "en"} onChange={handleLocaleChange} aria-label={t("common.language")}>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </LangSelect>
            <IconBtn type="button" aria-label={t("common.notifications")}>
              <Bell size={20} />
            </IconBtn>
          </TopBarTools>
        </TopBar>
        <ContentArea>{children}</ContentArea>
      </Main>
    </LayoutRoot>
  );
}
