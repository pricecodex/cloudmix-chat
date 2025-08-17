import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const wsMessageDto = z.object({
  from: z.string().nonempty(),
  to: z.string().nonempty(),
  content: z.string().max(MAX_LONG_VARCHAR),
});

export type WsMessageDto = z.infer<typeof wsMessageDto>;
