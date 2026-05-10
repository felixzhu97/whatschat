// Unit tests for ChatListScreen logic
describe('ChatListScreen Logic', () => {
  describe('Category filtering', () => {
    it('should filter by unread chats', () => {
      const filterUnread = (chats: any[]) => {
        return chats.filter((chat) => chat.unreadCount > 0);
      };

      const chats = [
        { id: '1', name: 'Chat 1', unreadCount: 2 },
        { id: '2', name: 'Chat 2', unreadCount: 0 },
        { id: '3', name: 'Chat 3', unreadCount: 5 },
      ];

      const unread = filterUnread(chats);
      expect(unread.length).toBe(2);
    });

    it('should filter by group chats', () => {
      const ChatType = { DIRECT: 'DIRECT', GROUP: 'GROUP' };

      const filterGroups = (chats: any[]) => {
        return chats.filter((chat) => chat.type === ChatType.GROUP);
      };

      const chats = [
        { id: '1', name: 'Direct Chat', type: 'DIRECT' },
        { id: '2', name: 'Group Chat', type: 'GROUP' },
      ];

      const groups = filterGroups(chats);
      expect(groups.length).toBe(1);
      expect(groups[0].name).toBe('Group Chat');
    });
  });

  describe('Search filtering', () => {
    it('should filter chats by name', () => {
      const filterByName = (chats: any[], query: string) => {
        const lowerQuery = query.toLowerCase();
        return chats.filter((chat) =>
          chat.name.toLowerCase().includes(lowerQuery)
        );
      };

      const chats = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Johnny Walker' },
      ];

      expect(filterByName(chats, 'john').length).toBe(2);
      expect(filterByName(chats, 'jane').length).toBe(1);
    });

    it('should filter chats by last message', () => {
      const filterByMessage = (chats: any[], query: string) => {
        const lowerQuery = query.toLowerCase();
        return chats.filter((chat) =>
          chat.lastMessageContent?.toLowerCase().includes(lowerQuery)
        );
      };

      const chats = [
        { id: '1', name: 'Chat 1', lastMessageContent: 'Hello there!' },
        { id: '2', name: 'Chat 2', lastMessageContent: 'Hi friend' },
      ];

      expect(filterByMessage(chats, 'hello').length).toBe(1);
      expect(filterByMessage(chats, 'hi').length).toBe(1);
    });
  });

  describe('Combined filtering', () => {
    it('should apply multiple filters', () => {
      const filterChats = (chats: any[], options: { search?: string; category?: number }) => {
        let filtered = [...chats];

        if (options.search) {
          const query = options.search.toLowerCase();
          filtered = filtered.filter(
            (chat) =>
              chat.name.toLowerCase().includes(query) ||
              chat.lastMessageContent?.toLowerCase().includes(query)
          );
        }

        if (options.category === 1) {
          filtered = filtered.filter((chat) => chat.unreadCount > 0);
        } else if (options.category === 3) {
          filtered = filtered.filter((chat) => chat.type === 'GROUP');
        }

        return filtered;
      };

      const chats = [
        { id: '1', name: 'John', lastMessageContent: 'Hi', unreadCount: 2, type: 'DIRECT' },
        { id: '2', name: 'Jane', lastMessageContent: 'Hello', unreadCount: 0, type: 'GROUP' },
      ];

      // Search for john, only unread
      const result = filterChats(chats, { search: 'john', category: 1 });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('John');
    });
  });
});
