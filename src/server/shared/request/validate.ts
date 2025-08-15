import { NextRequest } from "next/server";
import z, { ZodObject } from "zod";
import { BadRequestException } from "../exceptions/bad-request.exception";

export async function validateRequest<T extends ZodObject>(
  req: NextRequest,
  schema: T,
): Promise<z.infer<typeof schema>> {
  const body = req.json();
  const result = await schema.safeParseAsync(body);

  if (!result.success) {
    throw new BadRequestException(result.error.message);
  }

  return result.data;
}
