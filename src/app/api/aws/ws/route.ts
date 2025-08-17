import { authorizeSession } from "@/entities/session/services/authorize-session";
import { awsRequestDto, WsEndpoint } from "@/features/aws";
import { handleWsConnection } from "@/features/aws/ws-connect/service";
import { wsMessageDto } from "@/features/aws/ws-message/dto";
import { handleWsMessage } from "@/features/aws/ws-message/service";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { requestHandler } from "@/server/shared/request/handler";
import { validateSchema } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const reqBody = await req.json();
  const dto = await validateSchema(reqBody, awsRequestDto);

  const { action, endpoint, username, token, ...body } = dto.body;
  const successResponse = NextResponse.json({ message: "Success" });
  await authorizeSession({ username, token });

  switch (endpoint) {
    case WsEndpoint.Connect:
      await handleWsConnection({
        username,
        token,
        connectionId: dto["aws.connectionId"],
      });
      return successResponse;
    case WsEndpoint.Message: {
      const result = await validateSchema({ ...body, from: username }, wsMessageDto);
      await handleWsMessage(result);
      return successResponse;
    }
  }

  throw new BadRequestException(`Unhandled action ${action}`);
});
