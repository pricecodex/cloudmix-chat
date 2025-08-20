export type Chat = {
  id: string;
  username: string;
  lastMessage: string;
  lastMessageDate: string;
  isOnline: boolean;
};

export type Message = { from: string; text: string; createdAt?: string };
