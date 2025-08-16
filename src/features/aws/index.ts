import z from "zod";

export const WS_ACTION = "all";

export enum WsEndpoint {
  Connect = "connect",
  Message = "message",
}

export const awsRequestDto = z.object({
  "aws.connectionId": z.string().nonempty(),
  body: z
    .object({
      action: z.literal(WS_ACTION),
      endpoint: z.enum(WsEndpoint),
      username: z.string().nonempty(),
      token: z.string().nonempty(),
    })
    .loose(),
});

export type AwsRequestDto = z.infer<typeof awsRequestDto>;
