import { NextResponse } from "next/server";
import { BadRequestException } from "../exceptions/bad-request.exception";

export const requestHandler =
  async <T extends (...args: any[]) => Promise<NextResponse>>(callback: T) =>
  async (...args: any[]): Promise<NextResponse> => {
    {
      try {
        return callback(...args);
      } catch (err) {
        if (err instanceof BadRequestException) {
          return NextResponse.json({ message: err.message }, { status: 400 });
        }
        return NextResponse.json({ message: "UNKNOWN_ERROR" }, { status: 400 });
      }
    }
  };
