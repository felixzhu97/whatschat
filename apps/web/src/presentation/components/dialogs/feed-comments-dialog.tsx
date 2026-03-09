"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/presentation/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { usePostComments } from "../../hooks/use-feed";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/src/presentation/components/ui/instagram-spinner";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import type { FeedPost } from "@/shared/types";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BLUE = "rgb(0 149 246)";
const BG_GRAY = "rgb(239 239 239)";

const ModalBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 90vw;
  max-width: 936px;
  height: 85vh;
  max-height: 800px;
  background: rgb(255 255 255);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
`;

const ImageSection = styled.div`
  flex: 1;
  min-width: 0;
  background: rgb(0 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ImageSectionClickable = styled(ImageSection)`
  cursor: pointer;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const PostVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const CommentPlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const CommentPlayButtonCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
`;

const RightSection = styled.div`
  width: 400px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  border-left: ${BORDER};
`;

const PostHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  padding-right: 48px;
  border-bottom: ${BORDER};
  flex-shrink: 0;
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostHeaderMeta = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
`;

const PostHeaderMenuBtn = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${TEXT_PRIMARY};
  margin: -8px -8px -8px 0;
`;

const CaptionBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.25;
  flex-shrink: 0;
  border-bottom: ${BORDER};
`;

const CaptionMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const CaptionTop = styled.div`
  margin-bottom: 2px;
`;

const CaptionUsername = styled.span`
  font-weight: 600;
  margin-right: 6px;
`;

const CaptionMeta = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  margin-top: 4px;
`;

const LikesRow = styled.div`
  padding: 0 16px 2px;
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
  flex-shrink: 0;
`;

const TimeRow = styled.div`
  padding: 0 16px 12px;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  flex-shrink: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px 6px;
  gap: 12px;
  flex-shrink: 0;
`;

const ActionBtn = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  margin: -8px 0;
  color: ${(p: { $active?: boolean }) => (p.$active ? "rgb(237 73 86)" : TEXT_PRIMARY)};
`;

const CommentList = styled.div`
  flex: 1;
  min-height: 120px;
  overflow: auto;
  padding: 8px 0;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgb(219 219 219);
    border-radius: 3px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.25;
`;

const CommentAvatar = styled.div`
  flex-shrink: 0;
`;

const CommentMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommentTop = styled.div`
  margin-bottom: 2px;
`;

const CommentUsername = styled.span`
  font-weight: 600;
  margin-right: 6px;
  flex-shrink: 0;
`;

const CommentContent = styled.span`
  font-weight: 400;
  word-break: break-word;
`;

const CommentMeta = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  margin-top: 4px;
`;

const ReplyLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 12px;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  cursor: pointer;
  font-weight: 500;
`;

const CommentLikeBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${TEXT_SECONDARY};
  flex-shrink: 0;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 16px;
  border-top: ${BORDER};
  flex-shrink: 0;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 22px;
  background: ${BG_GRAY};
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  outline: none;
  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const PostBtn = styled.button`
  padding: 0 16px;
  background: none;
  color: ${BLUE};
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const LoadingRow = styled(InstagramSpinnerWrap)`
  padding: 24px 16px;
`;

function formatCommentTime(
  iso: string,
  t: (key: string, opts?: Record<string, string | number>) => string
): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return t("comments.minutesAgo", { count: Math.floor(diff / 60000) });
  if (diff < 86400000) return t("comments.hoursAgo", { count: Math.floor(diff / 3600000) });
  if (diff < 604800000) return t("comments.daysAgo", { count: Math.floor(diff / 86400000) });
  return t("comments.weeksAgo", { count: Math.floor(diff / 604800000) });
}

interface FeedCommentsDialogProps {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
  currentUser?: { id?: string; avatar?: string; username?: string } | null;
}

export function FeedCommentsDialog({ post, open, onClose, currentUser }: FeedCommentsDialogProps) {
  const { t } = useTranslation();
  const postId = post?.id ?? null;
  const { comments, loading, load, add } = usePostComments(postId);
  const [input, setInput] = useState("");
  const [videoPaused, setVideoPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (open && postId) load();
  }, [open, postId, load]);

  useEffect(() => {
    if (!open) setVideoPaused(false);
  }, [open]);

  const toggleCommentVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPaused) {
      video.play().catch(() => {});
      setVideoPaused(false);
    } else {
      video.pause();
      setVideoPaused(true);
    }
  }, [videoPaused]);

  const handleSend = () => {
    const text = input.trim();
    if (text) {
      add(text, currentUser?.id ? { userId: currentUser.id, username: currentUser.username } : undefined);
      setInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent
        closeInViewport
        accessibleTitle={t("comments.title")}
        style={{
          maxWidth: "none",
          width: "auto",
          padding: 0,
          gap: 0,
          border: "none",
          borderRadius: "12px",
        }}
      >
        <ModalBox>
          {post && (
            post.type === "VIDEO" || post.videoUrl ? (
              <ImageSectionClickable onClick={toggleCommentVideo}>
                <PostVideo
                  ref={videoRef}
                  src={post.videoUrl ?? post.imageUrl}
                  muted
                  loop
                  playsInline
                />
                {videoPaused && (
                  <CommentPlayOverlay>
                    <CommentPlayButtonCircle>
                      <Play size={36} fill="currentColor" stroke="none" />
                    </CommentPlayButtonCircle>
                  </CommentPlayOverlay>
                )}
              </ImageSectionClickable>
            ) : (
              <ImageSection>
                <PostImage src={post.imageUrl} alt="" />
              </ImageSection>
            )
          )}
          <RightSection>
            {post && (
              <PostHeaderRow>
                <PostHeaderLeft>
                  <Avatar style={{ width: 32, height: 32 }}>
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.username[0]}</AvatarFallback>
                  </Avatar>
                  <PostHeaderMeta>{post.username}</PostHeaderMeta>
                </PostHeaderLeft>
                <PostHeaderMenuBtn type="button" aria-label={t("feed.more")}>
                  <MoreHorizontal size={20} />
                </PostHeaderMenuBtn>
              </PostHeaderRow>
            )}
            {post && (post.caption ?? "").trim() !== "" && (
              <CaptionBlock>
                <CommentAvatar>
                  <Avatar style={{ width: 32, height: 32 }}>
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.username[0]}</AvatarFallback>
                  </Avatar>
                </CommentAvatar>
                <CaptionMain>
                  <CaptionTop>
                    <CaptionUsername>{post.username}</CaptionUsername>
                    {post.caption}
                  </CaptionTop>
                  <CaptionMeta>
                    {post.timestamp}
                    <ReplyLink type="button">{t("comments.reply")}</ReplyLink>
                  </CaptionMeta>
                </CaptionMain>
                <CommentLikeBtn type="button" aria-label={t("feed.like")}>
                  <Heart size={14} strokeWidth={1.5} />
                </CommentLikeBtn>
              </CaptionBlock>
            )}
            <CommentList>
              {loading && (
                <LoadingRow>
                  <InstagramSpinnerRing $size={24} />
                  <InstagramSpinnerText>{t("comments.loading")}</InstagramSpinnerText>
                </LoadingRow>
              )}
              {!loading &&
                comments.map((c) => (
                  <CommentItem key={c.id}>
                    <CommentAvatar>
                      <Avatar style={{ width: 32, height: 32 }}>
                        <AvatarImage src={undefined} />
                        <AvatarFallback>{(c.username ?? c.userId ?? "?")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </CommentAvatar>
                    <CommentMain>
                      <CommentTop>
                        <CommentUsername>{c.username ?? (c.userId ? c.userId.slice(0, 8) : t("comments.userFallback"))}</CommentUsername>
                        <CommentContent>{c.content}</CommentContent>
                      </CommentTop>
                      <CommentMeta>
                        {formatCommentTime(c.createdAt, t)}
                        <ReplyLink type="button">{t("comments.reply")}</ReplyLink>
                      </CommentMeta>
                    </CommentMain>
                    <CommentLikeBtn type="button" aria-label={t("feed.like")}>
                      <Heart size={14} strokeWidth={1.5} />
                    </CommentLikeBtn>
                  </CommentItem>
                ))}
            </CommentList>
            {post && (
              <>
                <ActionsRow>
                  <ActionBtn $active={post.isLiked} type="button" aria-label={t("feed.like")}>
                    <Heart size={24} fill={post.isLiked ? "currentColor" : "none"} strokeWidth={1.5} />
                  </ActionBtn>
                  <ActionBtn type="button" aria-label={t("feed.comment")}>
                    <MessageCircle size={24} strokeWidth={1.5} />
                  </ActionBtn>
                  <ActionBtn type="button" aria-label={t("feed.share")}>
                    <Send size={24} strokeWidth={1.5} />
                  </ActionBtn>
                  <ActionBtn $active={post.isSaved} type="button" aria-label={t("feed.save")}>
                    <Bookmark size={24} fill={post.isSaved ? "currentColor" : "none"} strokeWidth={1.5} />
                  </ActionBtn>
                </ActionsRow>
                <LikesRow>{t("feed.likesCount", { count: post.likeCount } as Record<string, string>)}</LikesRow>
                <TimeRow>{post.timestamp}</TimeRow>
              </>
            )}
            <InputRow>
              {currentUser && (
                <Avatar style={{ width: 32, height: 32, flexShrink: 0 }}>
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{(currentUser.username || "?")[0]}</AvatarFallback>
                </Avatar>
              )}
              <CommentInput
                placeholder={t("comments.addPlaceholder")}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSend()}
              />
              <PostBtn onClick={handleSend} disabled={!input.trim()}>
                {t("comments.postBtn")}
              </PostBtn>
            </InputRow>
          </RightSection>
        </ModalBox>
      </DialogContent>
    </Dialog>
  );
}
