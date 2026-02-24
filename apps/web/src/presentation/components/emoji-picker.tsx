"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/presentation/components/ui/button";
import { ScrollArea } from "@/src/presentation/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/presentation/components/ui/tabs";
import { Input } from "@/src/presentation/components/ui/input";
import { Search, Clock, Smile, Heart, Star, X } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = {
  recent: {
    name: "最近使用",
    icon: Clock,
    emojis: ["😀", "😂", "😍", "🥰", "😊", "😉", "😎", "🤔", "😴", "😋"],
  },
  smileys: {
    name: "表情",
    icon: Smile,
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
  },
  hands: {
    name: "手势",
    icon: X,
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉"],
  },
  hearts: {
    name: "心形",
    icon: Heart,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
  },
  items: {
    name: "物品",
    icon: Star,
    emojis: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🎯", "⚽", "🏀", "🎮"],
  },
};

const Root = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  border: 1px solid hsl(var(--border));
  width: 20rem;
  height: 24rem;
  z-index: 50;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const HeaderTitle = styled.h3`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const CloseBtn = styled(Button)`
  height: 1.5rem;
  width: 1.5rem;
`;

const XIcon = styled(X)`
  height: 1rem;
  width: 1rem;
`;

const SearchSection = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const SearchWrap = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  width: 1rem;
  color: rgb(156 163 175);
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
  height: 2rem;
`;

const ScrollSearch = styled(ScrollArea)`
  height: 20rem;
  padding: 0.75rem;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
`;

const EmojiBtn = styled(Button)`
  height: 2rem;
  width: 2rem;
  padding: 0;

  &:hover {
    background-color: rgb(243 244 246);
  }
`;

const EmojiSpan = styled.span`
  font-size: 1.125rem;
`;

const EmptySearch = styled.div`
  text-align: center;
  color: rgb(107 114 128);
  padding: 2rem 0;
`;

const TabsRoot = styled(Tabs)`
  height: 20rem;
`;

const TabsListStyled = styled(TabsList)`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(7, 1fr);
  height: 2.5rem;
  margin: 0 0.75rem 0.5rem;
`;

const TabsTriggerStyled = styled(TabsTrigger)`
  padding: 0.25rem;
`;

const TabsContentStyled = styled(TabsContent)`
  height: 16rem;
  margin-top: 0.5rem;
`;

const ScrollTabs = styled(ScrollArea)`
  height: 100%;
  padding: 0.75rem;
`;

const TabEmojiBtn = styled(Button)`
  height: 2rem;
  width: 2rem;
  padding: 0;

  &:hover {
    background-color: rgb(243 244 246);
  }
`;

const EmptyRecent = styled.div`
  text-align: center;
  color: rgb(107 114 128);
  padding: 2rem 0;
`;

const EmptyClock = styled(Clock)`
  height: 2rem;
  width: 2rem;
  margin: 0 auto 0.5rem;
  color: rgb(209 213 219);
`;

const Preview = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(31 41 55);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

export function EmojiPicker({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentEmojis");
      if (saved) setRecentEmojis(JSON.parse(saved));
    } catch {
      setRecentEmojis([]);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    const updatedRecent = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 24);
    setRecentEmojis(updatedRecent);
    try {
      localStorage.setItem("recentEmojis", JSON.stringify(updatedRecent));
    } catch {}
  };

  const filteredEmojis = searchQuery
    ? Object.values(emojiCategories).flatMap((category) =>
        category.emojis.filter((emoji) => emoji.includes(searchQuery))
      )
    : [];

  return (
    <Root ref={pickerRef}>
      <Header>
        <HeaderTitle>表情符号</HeaderTitle>
        <CloseBtn variant="ghost" size="icon" onClick={onClose}>
          <XIcon />
        </CloseBtn>
      </Header>

      <SearchSection>
        <SearchWrap>
          <SearchIcon />
          <SearchInput
            placeholder="搜索表情符号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrap>
      </SearchSection>

      {searchQuery ? (
        <ScrollSearch>
          <EmojiGrid>
            {filteredEmojis.map((emoji, index) => (
              <EmojiBtn
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                onMouseLeave={() => setHoveredEmoji(null)}
              >
                <EmojiSpan>{emoji}</EmojiSpan>
              </EmojiBtn>
            ))}
          </EmojiGrid>
          {filteredEmojis.length === 0 && (
            <EmptySearch>没有找到匹配的表情符号</EmptySearch>
          )}
        </ScrollSearch>
      ) : (
        <TabsRoot defaultValue="recent">
          <TabsListStyled>
            {Object.entries(emojiCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTriggerStyled key={key} value={key} title={category.name}>
                  <IconComponent size={16} />
                </TabsTriggerStyled>
              );
            })}
          </TabsListStyled>
          {Object.entries(emojiCategories).map(([key, category]) => (
            <TabsContentStyled key={key} value={key}>
              <ScrollTabs>
                <EmojiGrid>
                  {(key === "recent" ? recentEmojis : category.emojis).map((emoji, index) => (
                    <TabEmojiBtn
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiClick(emoji)}
                      onMouseEnter={() => setHoveredEmoji(emoji)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      title={emoji}
                    >
                      <EmojiSpan>{emoji}</EmojiSpan>
                    </TabEmojiBtn>
                  ))}
                </EmojiGrid>
                {key === "recent" && recentEmojis.length === 0 && (
                  <EmptyRecent>
                    <EmptyClock />
                    <p>暂无最近使用的表情</p>
                  </EmptyRecent>
                )}
              </ScrollTabs>
            </TabsContentStyled>
          ))}
        </TabsRoot>
      )}

      {hoveredEmoji && <Preview>{hoveredEmoji}</Preview>}
    </Root>
  );
}
