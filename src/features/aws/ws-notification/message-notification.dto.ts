import { string } from "@/server/shared/schema/string";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const wsMessageNotificationDto = z.object({
  from: string.nonempty(),
  chatId: string.nonempty(),
  createdAt: string.nonempty(),
  message: string.nonempty().max(MAX_LONG_VARCHAR),
});

export type WsMessageNotificationDto = z.infer<typeof wsMessageNotificationDto>;
