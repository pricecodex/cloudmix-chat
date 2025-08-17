import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const wsMessageNotificationDto = z.object({
  from: z.string().nonempty(),
  chatId: z.string().nonempty(),
  createdAt: z.string().nonempty(),
  message: z.string().nonempty().max(MAX_LONG_VARCHAR),
});

export type WsMessageNotificationDto = z.infer<typeof wsMessageNotificationDto>;
