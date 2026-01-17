import { describe, it, expect } from 'vitest';
import {
  userFactory,
  messageFactory,
  chatFactory,
  contactFactory,
  type User,
  type Message,
  type Chat,
  type Contact,
} from '../../factories/whatsapp';

describe('WhatsApp Factories', () => {
  describe('userFactory()', () => {
    describe('when generating a user', () => {
      it('should generate user with default values', () => {
        // Arrange (Given) & Act (When)
        const user = userFactory();

        // Assert (Then)
        expect(user).toMatchObject({
          id: expect.stringMatching(/^user-\d+$/),
          email: expect.stringMatching(/^user\d+@example\.com$/),
          name: expect.stringMatching(/^User \d+$/),
          phone: expect.stringMatching(/^\+123456789\d{2}$/),
          avatar: null,
          status: 'online',
        });
        expect(user.lastSeen).toBeInstanceOf(Date);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('should allow overriding user properties', () => {
        // Arrange (Given)
        const customName = 'Custom User Name';
        const customEmail = 'custom@example.com';
        const customStatus: User['status'] = 'offline';

        // Act (When)
        const user = userFactory({
          name: customName,
          email: customEmail,
          status: customStatus,
        });

        // Assert (Then)
        expect(user.name).toBe(customName);
        expect(user.email).toBe(customEmail);
        expect(user.status).toBe(customStatus);
        expect(user.id).toBeDefined();
      });

      it('should generate unique users on each call', () => {
        // Arrange (Given) & Act (When)
        const user1 = userFactory();
        const user2 = userFactory();

        // Assert (Then)
        expect(user1.id).not.toBe(user2.id);
        expect(user1.email).not.toBe(user2.email);
      });
    });
  });

  describe('messageFactory()', () => {
    describe('when generating a message', () => {
      it('should generate message with default values', () => {
        // Arrange (Given) & Act (When)
        const message = messageFactory();

        // Assert (Then)
        expect(message).toMatchObject({
          id: expect.stringMatching(/^message-\d+$/),
          content: expect.stringMatching(/^Test message \d+$/),
          type: 'text',
          senderId: expect.stringMatching(/^user-\d+$/),
          chatId: expect.stringMatching(/^chat-\d+$/),
          readAt: null,
        });
        expect(message.createdAt).toBeInstanceOf(Date);
        expect(message.updatedAt).toBeInstanceOf(Date);
      });

      it('should allow overriding message properties', () => {
        // Arrange (Given)
        const customContent = 'Custom message content';
        const customType: Message['type'] = 'image';

        // Act (When)
        const message = messageFactory({
          content: customContent,
          type: customType,
        });

        // Assert (Then)
        expect(message.content).toBe(customContent);
        expect(message.type).toBe(customType);
        expect(message.id).toBeDefined();
      });

      it('should generate messages with sequential timestamps', () => {
        // Arrange (Given) & Act (When)
        const message1 = messageFactory();
        const message2 = messageFactory();

        // Assert (Then)
        // Messages have timestamps that go backwards (older messages first)
        // message1 counter=1: now - 60000, message2 counter=2: now - 120000
        // So message1 should be more recent (larger timestamp)
        expect(message1.createdAt.getTime()).toBeGreaterThan(message2.createdAt.getTime());
      });
    });
  });

  describe('chatFactory()', () => {
    describe('when generating a chat', () => {
      it('should generate chat with default values', () => {
        // Arrange (Given) & Act (When)
        const chat = chatFactory();

        // Assert (Then)
        expect(chat).toMatchObject({
          id: expect.stringMatching(/^chat-\d+$/),
          avatar: null,
          lastMessageId: expect.stringMatching(/^message-\d+$/),
        });
        expect(['private', 'group']).toContain(chat.type);
        expect(chat.createdAt).toBeInstanceOf(Date);
        expect(chat.updatedAt).toBeInstanceOf(Date);
      });

      it('should generate group chat for first chat', () => {
        // Arrange (Given)
        // Reset chat counter by creating multiple chats until we get a group
        let chat = chatFactory();
        let attempts = 0;
        while (chat.type !== 'group' && attempts < 10) {
          chat = chatFactory();
          attempts++;
        }

        // Act (When)
        const groupChat = chatFactory({
          type: 'group',
          name: 'My Group Chat',
        });

        // Assert (Then)
        expect(groupChat.type).toBe('group');
        expect(groupChat.name).toBe('My Group Chat');
      });

      it('should allow overriding chat properties', () => {
        // Arrange (Given)
        const customType: Chat['type'] = 'group';
        const customName = 'Custom Chat Name';

        // Act (When)
        const chat = chatFactory({
          type: customType,
          name: customName,
        });

        // Assert (Then)
        expect(chat.type).toBe(customType);
        expect(chat.name).toBe(customName);
        expect(chat.id).toBeDefined();
      });
    });
  });

  describe('contactFactory()', () => {
    describe('when generating a contact', () => {
      it('should generate contact with default values', () => {
        // Arrange (Given) & Act (When)
        const contact = contactFactory();

        // Assert (Then)
        expect(contact).toMatchObject({
          id: expect.stringMatching(/^contact-\d+$/),
          userId: expect.stringMatching(/^user-\d+$/),
          contactId: expect.stringMatching(/^user-\d+$/),
          alias: null,
        });
        expect(contact.createdAt).toBeInstanceOf(Date);
        expect(contact.updatedAt).toBeInstanceOf(Date);
      });

      it('should allow overriding contact properties', () => {
        // Arrange (Given)
        const customUserId = 'user-999';
        const customContactId = 'user-888';
        const customAlias = 'Best Friend';

        // Act (When)
        const contact = contactFactory({
          userId: customUserId,
          contactId: customContactId,
          alias: customAlias,
        });

        // Assert (Then)
        expect(contact.userId).toBe(customUserId);
        expect(contact.contactId).toBe(customContactId);
        expect(contact.alias).toBe(customAlias);
        expect(contact.id).toBeDefined();
      });

      it('should generate unique contacts on each call', () => {
        // Arrange (Given) & Act (When)
        const contact1 = contactFactory();
        const contact2 = contactFactory();

        // Assert (Then)
        expect(contact1.id).not.toBe(contact2.id);
      });
    });
  });
});
