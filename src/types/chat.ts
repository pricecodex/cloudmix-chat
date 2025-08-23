export type Chat = {
  chatId: string;
  username: string;
  lastMessage: string;
  lastMessageDate: string;
  isOnline: boolean;
};

export type Message = { isMine: boolean; text: string; createdAt?: string };
