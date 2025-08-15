import z from "zod";

export const initSessionDto = z.object({
  username: z.string(),
});

export type InitSessionDto = z.infer<typeof initSessionDto>;
