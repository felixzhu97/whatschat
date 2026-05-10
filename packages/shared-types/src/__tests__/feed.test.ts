import { describe, it, expect } from "vitest";
import type {
  FeedPost,
  StoryItem,
  SuggestedUser,
} from "../feed";

describe("Feed Types", () => {
  // ============================================================
  // FeedPost - Test the feed post interface
  // ============================================================
  describe("FeedPost", () => {
    describe("when creating a basic feed post", () => {
      it("should create a valid feed post with required fields", () => {
        const post: FeedPost = {
          id: "post-1",
          userId: "user-1",
          username: "johndoe",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "42",
          commentCount: "10",
          caption: "Beautiful sunset!",
        };

        expect(post.id).toBe("post-1");
        expect(post.username).toBe("johndoe");
        expect(post.likeCount).toBe("42");
        expect(post.caption).toBe("Beautiful sunset!");
      });

      it("should support string-like counts", () => {
        const post: FeedPost = {
          id: "post-2",
          userId: "user-1",
          username: "janedoe",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "1.2K",
          commentCount: "500",
          caption: "Great photo!",
        };

        expect(post.likeCount).toBe("1.2K");
        expect(post.commentCount).toBe("500");
      });
    });

    describe("when handling like/save/follow states", () => {
      it("should indicate liked post", () => {
        const post: FeedPost = {
          id: "post-3",
          userId: "user-1",
          username: "janedoe",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "100",
          commentCount: "25",
          caption: "Great day!",
          isLiked: true,
          isSaved: false,
          isFollowing: true,
        };

        expect(post.isLiked).toBe(true);
        expect(post.isSaved).toBe(false);
        expect(post.isFollowing).toBe(true);
      });

      it("should indicate saved post", () => {
        const post: FeedPost = {
          id: "post-4",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "50",
          commentCount: "10",
          caption: "Save this!",
          isLiked: false,
          isSaved: true,
        };

        expect(post.isSaved).toBe(true);
        expect(post.isLiked).toBe(false);
      });

      it("should indicate following status", () => {
        const following: FeedPost = {
          id: "post-5",
          userId: "user-1",
          username: "celebrity",
          avatar: "https://example.com/celeb.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "10000",
          commentCount: "500",
          caption: "Following",
          isFollowing: true,
        };

        const notFollowing: FeedPost = {
          id: "post-6",
          userId: "user-2",
          username: "stranger",
          avatar: "https://example.com/stranger.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "10",
          commentCount: "5",
          caption: "Not following",
          isFollowing: false,
        };

        expect(following.isFollowing).toBe(true);
        expect(notFollowing.isFollowing).toBe(false);
      });

      it("should support all interaction states", () => {
        const post: FeedPost = {
          id: "post-7",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "100",
          commentCount: "50",
          caption: "All states!",
          isLiked: true,
          isSaved: true,
          isFollowing: false,
        };

        expect(post.isLiked).toBe(true);
        expect(post.isSaved).toBe(true);
        expect(post.isFollowing).toBe(false);
      });
    });

    describe("when handling sponsored posts", () => {
      it("should create a sponsored post", () => {
        const sponsoredPost: FeedPost = {
          id: "post-8",
          userId: "brand-1",
          username: "brand",
          avatar: "https://example.com/brand.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/ad.jpg",
          likeCount: "1000",
          commentCount: "50",
          caption: "Check out our new product!",
          isSponsored: true,
          adAccountId: "act-123",
          adCampaignId: "camp-456",
          adGroupId: "group-789",
          adCreativeId: "creative-001",
        };

        expect(sponsoredPost.isSponsored).toBe(true);
        expect(sponsoredPost.adAccountId).toBe("act-123");
        expect(sponsoredPost.adCampaignId).toBe("camp-456");
      });

      it("should identify non-sponsored post", () => {
        const regularPost: FeedPost = {
          id: "post-9",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "100",
          commentCount: "50",
          caption: "Regular post",
          isSponsored: false,
        };

        expect(regularPost.isSponsored).toBe(false);
      });

      it("should support sponsored post with minimal ad fields", () => {
        const sponsoredPost: FeedPost = {
          id: "post-10",
          userId: "brand-1",
          username: "brand",
          avatar: "https://example.com/brand.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/ad.jpg",
          likeCount: "500",
          commentCount: "25",
          caption: "Sponsored!",
          isSponsored: true,
          adAccountId: "act-001",
        };

        expect(sponsoredPost.isSponsored).toBe(true);
        expect(sponsoredPost.adAccountId).toBe("act-001");
        expect(sponsoredPost.adCampaignId).toBeUndefined();
      });
    });

    describe("when handling video posts", () => {
      it("should create a video post", () => {
        const videoPost: FeedPost = {
          id: "post-11",
          userId: "user-1",
          username: "videomaker",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/video-cover.jpg",
          videoUrl: "https://example.com/video.mp4",
          likeCount: "500",
          commentCount: "75",
          caption: "Check out this video!",
          type: "reel",
        };

        expect(videoPost.videoUrl).toBe("https://example.com/video.mp4");
        expect(videoPost.type).toBe("reel");
      });

      it("should support reel type", () => {
        const reelPost: FeedPost = {
          id: "post-12",
          userId: "user-1",
          username: "reeler",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/reel-cover.jpg",
          videoUrl: "https://example.com/reel.mp4",
          likeCount: "1000",
          commentCount: "100",
          caption: "New reel!",
          type: "reel",
        };

        expect(reelPost.type).toBe("reel");
      });

      it("should support story type", () => {
        const storyPost: FeedPost = {
          id: "post-13",
          userId: "user-1",
          username: "storyteller",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/story.jpg",
          videoUrl: "https://example.com/story.mp4",
          likeCount: "50",
          commentCount: "10",
          caption: "Story time!",
          type: "story",
        };

        expect(storyPost.type).toBe("story");
      });

      it("should support IGTV type", () => {
        const igtvPost: FeedPost = {
          id: "post-14",
          userId: "user-1",
          username: "creator",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/igtv-cover.jpg",
          videoUrl: "https://example.com/igtv.mp4",
          likeCount: "2000",
          commentCount: "200",
          caption: "Long form content!",
          type: "igtv",
        };

        expect(igtvPost.type).toBe("igtv");
      });
    });

    describe("when handling multiple media URLs", () => {
      it("should support carousel post with multiple images", () => {
        const carouselPost: FeedPost = {
          id: "post-15",
          userId: "user-1",
          username: "photographer",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/carousel-1.jpg",
          mediaUrls: [
            "https://example.com/carousel-1.jpg",
            "https://example.com/carousel-2.jpg",
            "https://example.com/carousel-3.jpg",
          ],
          likeCount: "200",
          commentCount: "30",
          caption: "Carousel post",
        };

        expect(carouselPost.mediaUrls).toHaveLength(3);
        expect(carouselPost.mediaUrls).toContain("https://example.com/carousel-1.jpg");
        expect(carouselPost.mediaUrls).toContain("https://example.com/carousel-2.jpg");
      });

      it("should support single item carousel", () => {
        const carouselPost: FeedPost = {
          id: "post-16",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/single.jpg",
          mediaUrls: ["https://example.com/single.jpg"],
          likeCount: "100",
          commentCount: "20",
          caption: "Single carousel",
        };

        expect(carouselPost.mediaUrls).toHaveLength(1);
      });

      it("should support large carousel", () => {
        const mediaUrls = Array.from(
          { length: 10 },
          (_, i) => `https://example.com/image-${i}.jpg`
        );
        const carouselPost: FeedPost = {
          id: "post-17",
          userId: "user-1",
          username: "photographer",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: mediaUrls[0],
          mediaUrls,
          likeCount: "500",
          commentCount: "50",
          caption: "10 image carousel",
        };

        expect(carouselPost.mediaUrls).toHaveLength(10);
      });
    });

    describe("when handling auto-tags", () => {
      it("should support auto-tags array", () => {
        const post: FeedPost = {
          id: "post-18",
          userId: "user-1",
          username: "influencer",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "1000",
          commentCount: "100",
          caption: "Amazing place!",
          autoTags: ["#travel", "#photography", "#nature"],
        };

        expect(post.autoTags).toHaveLength(3);
        expect(post.autoTags).toContain("#travel");
        expect(post.autoTags).toContain("#photography");
        expect(post.autoTags).toContain("#nature");
      });

      it("should support empty auto-tags", () => {
        const post: FeedPost = {
          id: "post-19",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "10",
          commentCount: "5",
          caption: "No tags",
          autoTags: [],
        };

        expect(post.autoTags).toHaveLength(0);
      });

      it("should support many auto-tags", () => {
        const autoTags = Array.from({ length: 30 }, (_, i) => `#tag${i}`);
        const post: FeedPost = {
          id: "post-20",
          userId: "user-1",
          username: "hashtagger",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "100",
          commentCount: "10",
          caption: "Many tags!",
          autoTags,
        };

        expect(post.autoTags).toHaveLength(30);
      });
    });

    describe("when handling cover images", () => {
      it("should support coverImageUrl", () => {
        const post: FeedPost = {
          id: "post-21",
          userId: "user-1",
          username: "creator",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/video.jpg",
          coverImageUrl: "https://example.com/cover.jpg",
          videoUrl: "https://example.com/video.mp4",
          likeCount: "50",
          commentCount: "5",
          caption: "Video post",
        };

        expect(post.coverImageUrl).toBe("https://example.com/cover.jpg");
      });

      it("should support coverUrl alternative", () => {
        const post: FeedPost = {
          id: "post-22",
          userId: "user-1",
          username: "creator",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/video.jpg",
          coverUrl: "https://example.com/cover-alt.jpg",
          videoUrl: "https://example.com/video.mp4",
          likeCount: "50",
          commentCount: "5",
          caption: "Video post",
        };

        expect(post.coverUrl).toBe("https://example.com/cover-alt.jpg");
      });

      it("should support both cover URLs", () => {
        const post: FeedPost = {
          id: "post-23",
          userId: "user-1",
          username: "creator",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/video.jpg",
          coverImageUrl: "https://example.com/cover-primary.jpg",
          coverUrl: "https://example.com/cover-alt.jpg",
          videoUrl: "https://example.com/video.mp4",
          likeCount: "50",
          commentCount: "5",
          caption: "Video post",
        };

        expect(post.coverImageUrl).toBe("https://example.com/cover-primary.jpg");
        expect(post.coverUrl).toBe("https://example.com/cover-alt.jpg");
      });
    });

    describe("edge cases", () => {
      it("should handle post with zero counts", () => {
        const post: FeedPost = {
          id: "post-24",
          userId: "user-1",
          username: "newuser",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "0",
          commentCount: "0",
          caption: "First post!",
        };

        expect(post.likeCount).toBe("0");
        expect(post.commentCount).toBe("0");
      });

      it("should handle post with large counts", () => {
        const post: FeedPost = {
          id: "post-25",
          userId: "celebrity-1",
          username: "celebrity",
          avatar: "https://example.com/celeb.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "1M",
          commentCount: "100K",
          caption: "Popular post!",
        };

        expect(post.likeCount).toBe("1M");
        expect(post.commentCount).toBe("100K");
      });

      it("should handle post with empty caption", () => {
        const post: FeedPost = {
          id: "post-26",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/image.jpg",
          likeCount: "10",
          commentCount: "5",
          caption: "",
        };

        expect(post.caption).toBe("");
      });

      it("should handle post with Unicode caption", () => {
        const post: FeedPost = {
          id: "post-27",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
          timestamp: new Date().toISOString(),
          imageUrl: "https://example.com/post.jpg",
          likeCount: "100",
          commentCount: "50",
          caption: "你好世界 🌍 مرحبا",
        };

        expect(post.caption).toContain("你好世界");
        expect(post.caption).toContain("🌍");
      });
    });
  });

  // ============================================================
  // StoryItem - Test the story item interface
  // ============================================================
  describe("StoryItem", () => {
    describe("when creating a basic story item", () => {
      it("should create a valid story item with required fields", () => {
        const story: StoryItem = {
          id: "story-1",
          userId: "user-1",
          username: "johndoe",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(story.id).toBe("story-1");
        expect(story.username).toBe("johndoe");
      });

      it("should have both id and userId fields", () => {
        const story: StoryItem = {
          id: "story-2",
          userId: "user-1",
          username: "user",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(story.id).toBe("story-2");
        expect(story.userId).toBe("user-1");
      });
    });

    describe("when handling unseen status", () => {
      it("should indicate unseen story", () => {
        const storyWithUnseen: StoryItem = {
          id: "story-3",
          userId: "user-2",
          username: "janedoe",
          avatar: "https://example.com/avatar2.jpg",
          hasUnseen: true,
        };

        expect(storyWithUnseen.hasUnseen).toBe(true);
      });

      it("should indicate seen story", () => {
        const storySeen: StoryItem = {
          id: "story-4",
          userId: "user-3",
          username: "bob",
          avatar: "https://example.com/avatar3.jpg",
          hasUnseen: false,
        };

        expect(storySeen.hasUnseen).toBe(false);
      });

      it("should default to undefined when not specified", () => {
        const story: StoryItem = {
          id: "story-5",
          userId: "user-4",
          username: "alice",
          avatar: "https://example.com/alice.jpg",
        };

        expect(story.hasUnseen).toBeUndefined();
      });
    });

    describe("edge cases", () => {
      it("should handle story with minimal fields", () => {
        const story: StoryItem = {
          id: "story-6",
          userId: "user-5",
          username: "minimal",
          avatar: "https://example.com/minimal.jpg",
        };

        expect(story.id).toBeDefined();
        expect(story.userId).toBeDefined();
        expect(story.hasUnseen).toBeUndefined();
      });

      it("should handle user story viewed by self", () => {
        const story: StoryItem = {
          id: "story-7",
          userId: "user-6",
          username: "me",
          avatar: "https://example.com/me.jpg",
          hasUnseen: false,
        };

        expect(story.hasUnseen).toBe(false);
      });
    });
  });

  // ============================================================
  // SuggestedUser - Test the suggested user interface
  // ============================================================
  describe("SuggestedUser", () => {
    describe("when creating a suggested user with all fields", () => {
      it("should create a valid suggested user", () => {
        const suggested: SuggestedUser = {
          id: "user-100",
          username: "neighbor",
          displayName: "Neighbor Smith",
          avatar: "https://example.com/suggested.jpg",
          description: "Followed by 5 people you know",
        };

        expect(suggested.id).toBe("user-100");
        expect(suggested.displayName).toBe("Neighbor Smith");
        expect(suggested.description).toContain("Followed by");
      });

      it("should support username and displayName separately", () => {
        const suggested: SuggestedUser = {
          id: "user-101",
          username: "john_doe_123",
          displayName: "John Doe",
          avatar: "https://example.com/john.jpg",
          description: "Popular user",
        };

        expect(suggested.username).toBe("john_doe_123");
        expect(suggested.displayName).toBe("John Doe");
      });
    });

    describe("when creating a suggested user without optional fields", () => {
      it("should allow optional displayName", () => {
        const suggested: SuggestedUser = {
          id: "user-102",
          username: "neighbor2",
          avatar: "https://example.com/suggested2.jpg",
          description: "Popular this week",
        };

        expect(suggested.displayName).toBeUndefined();
        expect(suggested.username).toBe("neighbor2");
      });

      it("should require id, username, avatar, and description", () => {
        const suggested: SuggestedUser = {
          id: "user-103",
          username: "required_fields",
          avatar: "https://example.com/avatar.jpg",
          description: "Required description",
        };

        expect(suggested.id).toBeDefined();
        expect(suggested.username).toBeDefined();
        expect(suggested.avatar).toBeDefined();
        expect(suggested.description).toBeDefined();
      });
    });

    describe("when handling suggested user descriptions", () => {
      it("should support 'Followed by' description", () => {
        const suggested: SuggestedUser = {
          id: "user-104",
          username: "followed_user",
          avatar: "https://example.com/avatar.jpg",
          description: "Followed by 10 people you know",
        };

        expect(suggested.description).toContain("Followed by");
      });

      it("should support 'Popular' description", () => {
        const suggested: SuggestedUser = {
          id: "user-105",
          username: "popular_user",
          avatar: "https://example.com/avatar.jpg",
          description: "Popular this week",
        };

        expect(suggested.description).toBe("Popular this week");
      });

      it("should support 'New' description", () => {
        const suggested: SuggestedUser = {
          id: "user-106",
          username: "new_user",
          avatar: "https://example.com/avatar.jpg",
          description: "New to WhatsFeed",
        };

        expect(suggested.description).toBe("New to WhatsFeed");
      });

      it("should support custom description", () => {
        const suggested: SuggestedUser = {
          id: "user-107",
          username: "custom",
          avatar: "https://example.com/avatar.jpg",
          description: "Similar interests: Photography",
        };

        expect(suggested.description).toContain("Similar interests");
      });
    });

    describe("edge cases", () => {
      it("should handle suggested user with no displayName", () => {
        const suggested: SuggestedUser = {
          id: "user-108",
          username: "no_display",
          avatar: "https://example.com/avatar.jpg",
          description: "Suggested",
        };

        expect(suggested.displayName).toBeUndefined();
      });

      it("should handle suggested user with empty description", () => {
        const suggested: SuggestedUser = {
          id: "user-109",
          username: "empty_desc",
          avatar: "https://example.com/avatar.jpg",
          description: "",
        };

        expect(suggested.description).toBe("");
      });

      it("should handle Unicode characters in description", () => {
        const suggested: SuggestedUser = {
          id: "user-110",
          username: "unicode_user",
          avatar: "https://example.com/avatar.jpg",
          description: "关注者 1000+ 🇨🇳",
        };

        expect(suggested.description).toContain("关注者");
      });
    });
  });
});
