import z from "zod";

export const wsMessageNotificationDto = z.object({
  from: z.string().nonempty(),
  chatId: z.string().nonempty(),
  createdAt: z.string().nonempty(),
});

export type WsMessageNotificationDto = z.infer<typeof wsMessageNotificationDto>;
