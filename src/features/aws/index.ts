import { string } from "@/server/shared/schema/string";
import z from "zod";

export const WS_ACTION = "all";

export enum WsEndpoint {
  Connect = "connect",
  Message = "message",
}

export const awsRequestDto = z.object({
  "aws.connectionId": string.nonempty(),
  body: z
    .object({
      action: z.literal(WS_ACTION),
      endpoint: z.enum(WsEndpoint),
      username: string.nonempty(),
      token: string.nonempty(),
    })
    .loose(),
});

export type AwsRequestDto = z.infer<typeof awsRequestDto>;
