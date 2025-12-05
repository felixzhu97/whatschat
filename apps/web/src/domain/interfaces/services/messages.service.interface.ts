import { Message } from "../../entities/message.entity";

export interface IMessagesService {
  getMessagesForContact(contactId: string): Message[];
  addMessage(contactId: string, message: Message): void;
  updateMessage(
    contactId: string,
    messageId: string,
    updates: Partial<Message>
  ): void;
  deleteMessage(contactId: string, messageId: string): void;
  deleteMessages(contactId: string, messageIds: string[]): void;
  sendMessage(
    contactId: string,
    content: string,
    type?: Message["type"]
  ): Promise<void>;
  editMessage(
    contactId: string,
    messageId: string,
    newContent: string
  ): void;
  forwardMessage(messageId: string, targetContactIds: string[]): void;
  replyToMessage(
    contactId: string,
    replyTo: Message,
    content: string
  ): void;
  markAsRead(contactId: string, messageIds: string[]): void;
  markAsDelivered(contactId: string, messageIds: string[]): void;
  updateMessageStatus(
    contactId: string,
    messageId: string,
    status: Message["status"]
  ): void;
  toggleStarMessage(contactId: string, messageId: string): void;
  getStarredMessages(): Message[];
  searchMessages(query: string, contactId?: string): Message[];
  getMessageById(
    contactId: string,
    messageId: string
  ): Message | undefined;
  getLastMessage(contactId: string): Message | undefined;
  getUnreadCount(contactId: string): number;
  setTyping(contactId: string, isTyping: boolean): void;
  isUserTyping(contactId: string): boolean;
}

