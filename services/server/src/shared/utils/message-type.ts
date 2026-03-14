import { MessageType } from '@prisma/client';

const MESSAGE_TYPES: MessageType[] = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION', 'CONTACT'];

export function toMessageType(value: string): MessageType {
  const upper = value.toUpperCase();
  return MESSAGE_TYPES.includes(upper as MessageType) ? (upper as MessageType) : 'TEXT';
}
