"use client";

import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import type { StoryItem, FeedPost } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

const FeedRoot = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 630px;
  margin: 0 auto;
  padding: 1.5rem 0;
  width: 100%;
`;

const StoriesWrap = styled.div`
  padding: 1rem 0;
  margin-bottom: 1rem;
  overflow-x: auto;
`;

const StoriesScroll = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  min-width: min-content;
`;

const StoryItemWrap = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
`;

const StoryRing = styled.div<{ $hasUnseen?: boolean }>`
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 3px;
  background: ${(p) =>
    p.$hasUnseen
      ? "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
      : "rgb(219 219 219)"};
`;

const StoryAvatarWrap = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgb(255 255 255);
  padding: 2px;
  box-sizing: border-box;
`;

const StoryUsername = styled.span`
  font-size: 0.75rem;
  color: rgb(38 38 38);
  max-width: 74px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostCard = styled.article`
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const PostHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PostMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const PostUsername = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(38 38 38);
`;

const PostTime = styled.span`
  font-size: 0.75rem;
  color: rgb(142 142 142);
`;

const PostMoreBtn = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: rgb(38 38 38);
`;

const PostImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: rgb(250 250 250);
  overflow: hidden;
`;

const PostImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
`;

const PostActionBtn = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: ${(p) => (p.$active ? "rgb(237 73 86)" : "rgb(38 38 38)")};
`;

const PostActionRight = styled.div`
  margin-left: auto;
`;

const PostLikes = styled.div`
  padding: 0 1rem 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const PostCaption = styled.div`
  padding: 0 1rem 1rem;
  font-size: 0.875rem;
  color: rgb(38 38 38);
  line-height: 1.25;
`;

const CaptionUsername = styled.span`
  font-weight: 600;
  margin-right: 0.25rem;
`;

interface InstagramFeedProps {
  stories: StoryItem[];
  posts: FeedPost[];
}

export function InstagramFeed({ stories, posts }: InstagramFeedProps) {
  return (
    <FeedRoot>
      <StoriesWrap>
        <StoriesScroll>
          {stories.map((s) => (
            <StoryItemWrap key={s.id}>
              <StoryRing $hasUnseen={s.hasUnseen}>
                <StoryAvatarWrap>
                  <Avatar style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
                    <AvatarImage src={s.avatar} />
                    <AvatarFallback>{s.username[0]}</AvatarFallback>
                  </Avatar>
                </StoryAvatarWrap>
              </StoryRing>
              <StoryUsername>{s.username}</StoryUsername>
            </StoryItemWrap>
          ))}
        </StoriesScroll>
      </StoriesWrap>

      {posts.map((post) => (
        <PostCard key={post.id}>
          <PostHeader>
            <PostHeaderLeft>
              <Avatar style={{ width: 32, height: 32 }}>
                <AvatarImage src={post.avatar} />
                <AvatarFallback>{post.username[0]}</AvatarFallback>
              </Avatar>
              <PostMeta>
                <PostUsername>{post.username}</PostUsername>
                <PostTime>{post.timestamp}</PostTime>
              </PostMeta>
            </PostHeaderLeft>
            <PostMoreBtn>
              <MoreHorizontal size={20} />
            </PostMoreBtn>
          </PostHeader>
          <PostImageWrap>
            <PostImg src={post.imageUrl} alt="" />
          </PostImageWrap>
          <PostActions>
            <PostActionBtn $active={post.isLiked}>
              <Heart size={24} fill={post.isLiked ? "currentColor" : "none"} strokeWidth={1.5} />
            </PostActionBtn>
            <PostActionBtn>
              <MessageCircle size={24} strokeWidth={1.5} />
            </PostActionBtn>
            <PostActionBtn>
              <Send size={24} strokeWidth={1.5} />
            </PostActionBtn>
            <PostActionRight>
              <PostActionBtn $active={post.isSaved}>
                <Bookmark size={24} fill={post.isSaved ? "currentColor" : "none"} strokeWidth={1.5} />
              </PostActionBtn>
            </PostActionRight>
          </PostActions>
          <PostLikes>{post.likeCount} 次赞</PostLikes>
          <PostCaption>
            <CaptionUsername>{post.username}</CaptionUsername>
            {post.caption}
          </PostCaption>
        </PostCard>
      ))}
    </FeedRoot>
  );
}
