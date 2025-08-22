export type Chat = {
  id: string;
  username: string;
  lastMessage: string;
  lastMessageDate: string;
  isOnline: boolean;
};

export type Message = { isMine: boolean; text: string; createdAt?: string };
