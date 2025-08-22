import { string } from "@/server/shared/schema/string";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const wsMessageDto = z.object({
  from: string.nonempty(),
  to: string.nonempty(),
  content: string.max(MAX_LONG_VARCHAR),
});

export type WsMessageDto = z.infer<typeof wsMessageDto>;
