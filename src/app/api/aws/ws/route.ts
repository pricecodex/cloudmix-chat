import { awsRequestDto, WsAction } from "@/features/aws";
import { handleWsConnection } from "@/features/aws/ws-connect/service";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, awsRequestDto);

  const { aciton: action, username, token, ...body } = dto.body;
  const successResponse = NextResponse.json({ message: "Success" });

  switch (action) {
    case WsAction.Connect:
      await handleWsConnection({
        username,
        token,
        connectionId: dto.connectionId,
      });
      return successResponse;
  }

  throw new BadRequestException(`Unhandled action ${action}`);
});
