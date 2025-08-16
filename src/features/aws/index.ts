import z from "zod";

export enum WsAction {
  Connect = "connent",
  Message = "message",
}

export const awsRequestDto = z.object({
  connectionId: z.string().nonempty(),
  body: z
    .object({
      aciton: z.enum(WsAction),
      username: z.string().nonempty(),
      token: z.string().nonempty(),
    })
    .loose(),
});

export type AwsRequestDto = z.infer<typeof awsRequestDto>;
