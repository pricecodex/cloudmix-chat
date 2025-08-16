import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { Chat } from "@/entities/chat/chat.entity";
import { Session } from "@/entities/session/session.entity";
import { User } from "@/entities/user/user.entity";

export const BILLING_MODE = "PAY_PER_REQUEST";
export const PRIMARY_KEY = "HASH";
export const SORT_KEY = "RANGE";

export const WS_EXIRE_SECS = 60;

export const MAX_SHORT_VARCHAR = 512;
export const MAX_LONG_VARCHAR = 5000;

export const ENTITIES = [User, Session, Chat, ChatMessage];
