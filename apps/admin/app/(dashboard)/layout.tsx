"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/presentation/providers/auth-provider";
import { styled } from "@/src/shared/utils/emotion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UsersRound,
  LogOut,
  Menu,
} from "lucide-react";

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #fff;
  border-right: 1px solid #e9edef;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #e9edef;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #075e54;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 1rem 0.5rem;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: ${(p) => (p.$active ? "#075e54" : "#54656f")};
  font-size: 0.9375rem;
  font-weight: ${(p) => (p.$active ? 500 : 400)};
  background: ${(p) => (p.$active ? "#e7f5f3" : "transparent")};
  margin-bottom: 0.25rem;
  text-decoration: none;
  &:hover {
    background: #f0f2f5;
    color: #075e54;
  }
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #e9edef;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #54656f;
  font-size: 0.9375rem;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #f0f2f5;
    color: #dc3545;
  }
`;

const Main = styled.main`
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
`;

const routes = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/users", label: "用户管理", icon: Users },
  { href: "/chats", label: "聊天管理", icon: MessageSquare },
  { href: "/groups", label: "群组管理", icon: UsersRound },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <LayoutRoot>
        <Main style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          加载中...
        </Main>
      </LayoutRoot>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <LayoutRoot>
      <Sidebar>
        <SidebarHeader>
          <Logo>
            <Menu size={22} />
            WhatsChat Admin
          </Logo>
        </SidebarHeader>
        <Nav>
          {routes.map((r) => (
            <NavLink
              key={r.href}
              href={r.href}
              $active={pathname === r.href || (r.href !== "/" && pathname.startsWith(r.href))}
            >
              <r.icon size={20} />
              {r.label}
            </NavLink>
          ))}
        </Nav>
        <SidebarFooter>
          <div style={{ fontSize: "0.75rem", color: "#8696a0", marginBottom: "0.5rem" }}>
            {user?.email}
          </div>
          <LogoutBtn onClick={logout}>
            <LogOut size={20} />
            退出登录
          </LogoutBtn>
        </SidebarFooter>
      </Sidebar>
      <Main>{children}</Main>
    </LayoutRoot>
  );
}
