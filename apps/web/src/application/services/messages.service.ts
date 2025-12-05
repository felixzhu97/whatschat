import { IMessagesService } from "../../domain/interfaces/services/messages.service.interface";
import { Message } from "../../domain/entities/message.entity";
import { useMessagesStore } from "../../infrastructure/adapters/state/messages-state.adapter";

export class MessagesService implements IMessagesService {
  private store = useMessagesStore.getState();

  getMessagesForContact(contactId: string): Message[] {
    return this.store.getMessagesForContact(contactId);
  }

  addMessage(contactId: string, message: Message): void {
    this.store.addMessage(contactId, message);
  }

  updateMessage(
    contactId: string,
    messageId: string,
    updates: Partial<Message>
  ): void {
    this.store.updateMessage(contactId, messageId, updates);
  }

  deleteMessage(contactId: string, messageId: string): void {
    this.store.deleteMessage(contactId, messageId);
  }

  deleteMessages(contactId: string, messageIds: string[]): void {
    this.store.deleteMessages(contactId, messageIds);
  }

  async sendMessage(
    contactId: string,
    content: string,
    type: Message["type"] = "text"
  ): Promise<void> {
    const message = Message.create({
      id: this.store.generateMessageId(),
      senderId: this.store.currentUserId,
      senderName: "我",
      content,
      timestamp: new Date().toISOString(),
      type,
      status: "sending",
    });

    this.store.addMessage(contactId, message);

    // 模拟发送过程
    setTimeout(() => {
      this.store.updateMessage(contactId, message.id, { status: "sent" });
      setTimeout(() => {
        this.store.updateMessage(contactId, message.id, {
          status: "delivered",
        });
      }, 1000);
    }, 500);
  }

  editMessage(
    contactId: string,
    messageId: string,
    newContent: string
  ): void {
    const message = this.store.getMessageById(contactId, messageId);
    if (message && this.store.canEditMessage(message)) {
      const editedMessage = message.edit(newContent);
      this.store.updateMessage(contactId, messageId, {
        content: editedMessage.content,
        isEdited: editedMessage.isEdited,
        editedAt: editedMessage.editedAt,
      });
      this.store.setEditingMessage(null);
    }
  }

  forwardMessage(messageId: string, targetContactIds: string[]): void {
    const { messages } = this.store;
    let originalMessage: Message | undefined;

    for (const contactId in messages) {
      const found = messages[contactId].find((msg) => msg.id === messageId);
      if (found) {
        originalMessage = found;
        break;
      }
    }

    if (originalMessage) {
      targetContactIds.forEach((contactId) => {
        const forwardedMessage = Message.create({
          ...originalMessage!,
          id: this.store.generateMessageId(),
          senderId: this.store.currentUserId,
          senderName: "我",
          timestamp: new Date().toISOString(),
          status: "sending",
          isForwarded: true,
        });
        this.store.addMessage(contactId, forwardedMessage);
      });
    }
  }

  replyToMessage(contactId: string, replyTo: Message, content: string): void {
    const message = Message.create({
      id: this.store.generateMessageId(),
      senderId: this.store.currentUserId,
      senderName: "我",
      content,
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sending",
      replyTo: replyTo.id,
    });

    this.store.addMessage(contactId, message);
    this.store.setReplyingTo(null);
  }

  markAsRead(contactId: string, messageIds: string[]): void {
    messageIds.forEach((messageId) => {
      this.store.updateMessage(contactId, messageId, { status: "read" });
    });
  }

  markAsDelivered(contactId: string, messageIds: string[]): void {
    messageIds.forEach((messageId) => {
      const message = this.store.getMessageById(contactId, messageId);
      if (message && message.status === "sent") {
        this.store.updateMessage(contactId, messageId, {
          status: "delivered",
        });
      }
    });
  }

  updateMessageStatus(
    contactId: string,
    messageId: string,
    status: Message["status"]
  ): void {
    this.store.updateMessage(contactId, messageId, { status });
  }

  toggleStarMessage(contactId: string, messageId: string): void {
    const message = this.store.getMessageById(contactId, messageId);
    if (message) {
      const starredMessage = message.toggleStar();
      this.store.updateMessage(contactId, messageId, {
        isStarred: starredMessage.isStarred,
      });
    }
  }

  getStarredMessages(): Message[] {
    return this.store.getStarredMessages();
  }

  searchMessages(query: string, contactId?: string): Message[] {
    return this.store.searchMessages(query, contactId);
  }

  getMessageById(contactId: string, messageId: string): Message | undefined {
    return this.store.getMessageById(contactId, messageId);
  }

  getLastMessage(contactId: string): Message | undefined {
    return this.store.getLastMessage(contactId);
  }

  getUnreadCount(contactId: string): number {
    return this.store.getUnreadCount(contactId);
  }

  setTyping(contactId: string, isTyping: boolean): void {
    this.store.setTyping(contactId, isTyping);
  }

  isUserTyping(contactId: string): boolean {
    return this.store.isUserTyping(contactId);
  }
}

// 创建单例实例
let messagesServiceInstance: MessagesService | null = null;

export const getMessagesService = (): IMessagesService => {
  if (!messagesServiceInstance) {
    messagesServiceInstance = new MessagesService();
  }
  return messagesServiceInstance;
};

