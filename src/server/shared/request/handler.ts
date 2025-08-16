import { NextResponse } from "next/server";
import { BadRequestException } from "../exceptions/bad-request.exception";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";

export const requestHandler =
  <T extends (...args: any[]) => Promise<NextResponse>>(callback: T) =>
  async (...args: any[]): Promise<NextResponse> => {
    try {
      return await callback(...args);
    } catch (err) {
      if (err instanceof BadRequestException) {
        return NextResponse.json({ message: err.message }, { status: 400 });
      }
      if (err instanceof UnauthorizedException) {
        return NextResponse.json({ message: err.message }, { status: 401 });
      }
      console.log(err);
      return NextResponse.json({ message: "UNKNOWN_ERROR" }, { status: 400 });
    }
  };
