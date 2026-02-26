"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/presentation/providers/auth-provider";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UsersRound,
  Settings,
  LogOut,
  Search,
  Bell,
} from "lucide-react";

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.bg};
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${theme.surface};
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${theme.border};
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
  margin-bottom: 0.25rem;
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
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: ${theme.bg};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: ${theme.surface};
  border-bottom: 1px solid ${theme.border};
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

const SearchInput = styled.input`
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  background: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  color: ${theme.text};
  font-size: 0.875rem;
  width: 240px;
  &:focus {
    outline: none;
    border-color: ${theme.primary};
  }
  &::placeholder {
    color: ${theme.textSecondary};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  & svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.iconMuted};
    width: 18px;
  }
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
  &:hover {
    background: ${theme.surfaceAlt};
    color: ${theme.text};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 1.5rem;
`;

const routes = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/users", label: "用户管理", icon: Users },
  { href: "/chats", label: "聊天管理", icon: MessageSquare },
  { href: "/groups", label: "群组管理", icon: UsersRound },
  { href: "/settings", label: "设置", icon: Settings },
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
        <Main style={{ display: "flex", alignItems: "center", justifyContent: "center", color: theme.textSecondary }}>
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
            <LogoIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </LogoIcon>
            <LogoText>WhatsChat Admin</LogoText>
          </Logo>
        </SidebarHeader>
        <NavLabel>导航</NavLabel>
        <Nav>
          {routes.map((r) => (
            <NavLink
              key={r.href}
              href={r.href}
              active={pathname === r.href || (r.href !== "/" && pathname.startsWith(r.href))}
            >
              <r.icon size={20} />
              {r.label}
            </NavLink>
          ))}
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
            退出登录
          </LogoutBtn>
        </SidebarFooter>
      </Sidebar>
      <Main>
        <TopBar>
          <TopBarLeft>
            <div>
              <TopBarTitle>
                {pathname === "/" && "仪表盘"}
                {pathname.startsWith("/users") && "用户管理"}
                {pathname.startsWith("/chats") && "聊天管理"}
                {pathname.startsWith("/groups") && "群组管理"}
                {pathname.startsWith("/settings") && "设置"}
              </TopBarTitle>
              <TopBarSubtitle>
                {pathname === "/" && "WhatsApp 业务概览"}
                {pathname.startsWith("/users") && "管理用户账户"}
                {pathname.startsWith("/chats") && "管理聊天会话"}
                {pathname.startsWith("/groups") && "管理群组"}
                {pathname.startsWith("/settings") && "系统设置"}
              </TopBarSubtitle>
            </div>
          </TopBarLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SearchWrapper>
              <Search size={18} />
              <SearchInput placeholder="搜索..." />
            </SearchWrapper>
            <IconBtn>
              <Bell size={20} />
            </IconBtn>
          </div>
        </TopBar>
        <ContentArea>{children}</ContentArea>
      </Main>
    </LayoutRoot>
  );
}
