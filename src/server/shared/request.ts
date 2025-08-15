import { NextResponse } from "next/server";

export const requestHandler =
  async <T extends (...args: any[]) => Promise<NextResponse>>(callback: T) =>
  async (...args: any[]): Promise<NextResponse> => {
    {
      try {
        return callback(...args);
      } catch {
        return NextResponse.json({}, { status: 400 });
      }
    }
  };
