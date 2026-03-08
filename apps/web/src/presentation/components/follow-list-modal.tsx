"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/presentation/components/ui/dialog";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";

const api = new FeedApiAdapter(getApiClient());

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: rgb(239 239 239);
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 0.875rem;
  outline: none;
  color: rgb(38 38 38);
  &::placeholder {
    color: rgb(142 142 142);
  }
`;

const ListWrap = styled.div`
  max-height: 360px;
  overflow-y: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgb(219 219 219);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const BtnFollow = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(0 149 246);
  cursor: pointer;
  &:hover {
    color: rgb(0 119 197);
  }
`;

const BtnFollowing = styled.button`
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgb(219 219 219);
  background: rgb(239 239 239);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(38 38 38);
  cursor: pointer;
  &:hover {
    background: rgb(219 219 219);
  }
`;

const BtnRemove = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(142 142 142);
  cursor: pointer;
  &:hover {
    color: rgb(38 38 38);
  }
`;

export interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  title: "followers" | "following";
  userId: string;
  currentUserId: string | undefined;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export function FollowListModal({
  open,
  onClose,
  title,
  userId,
  currentUserId,
  onFollow,
  onUnfollow,
}: FollowListModalProps) {
  const { t } = useTranslation();
  const [list, setList] = useState<Array<{ id: string; username: string; avatar: string | null }>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<string | undefined>();

  const load = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    const promise = title === "followers" ? api.getFollowers(userId, 20) : api.getFollowing(userId, 20);
    promise
      .then((res) => {
        setList(res.list);
        setPageState(res.pageState);
      })
      .finally(() => setLoading(false));
  }, [userId, title]);

  useEffect(() => {
    if (open && userId) load();
    if (!open) setSearch("");
  }, [open, userId, load]);

  const filtered = search.trim()
    ? list.filter((u) => u.username.toLowerCase().includes(search.trim().toLowerCase()))
    : list;

  const titleKey = title === "followers" ? "profile.followersTitle" : "profile.followingTitle";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent accessibleTitle={t(titleKey)}>
        <DialogHeader>
          <DialogTitle style={{ textAlign: "center" }}>{t(titleKey)}</DialogTitle>
        </DialogHeader>
        <SearchWrap>
          <Search size={16} color="rgb(142 142 142)" />
          <SearchInput
            type="text"
            placeholder={t("profile.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        <ListWrap>
          {loading ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "rgb(142 142 142)" }}>
              ...
            </div>
          ) : (
            filtered.map((u) => (
              <Row key={u.id}>
                <Avatar style={{ width: 44, height: 44 }}>
                  <AvatarImage src={u.avatar || undefined} />
                  <AvatarFallback>{u.username[0]}</AvatarFallback>
                </Avatar>
                <UserInfo>
                  <Username>{u.username}</Username>
                </UserInfo>
                {currentUserId && u.id !== currentUserId && (
                  title === "followers" ? (
                    <BtnFollow type="button" onClick={() => onFollow?.(u.id)}>
                      {t("sidebar.follow")}
                    </BtnFollow>
                  ) : (
                    <BtnFollowing type="button" onClick={() => onUnfollow?.(u.id)}>
                      {t("profile.followingBtn")}
                    </BtnFollowing>
                  )
                )}
              </Row>
            ))
          )}
        </ListWrap>
      </DialogContent>
    </Dialog>
  );
}
