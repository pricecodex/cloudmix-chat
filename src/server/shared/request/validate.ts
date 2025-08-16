import { NextRequest } from "next/server";
import z, { treeifyError, ZodObject } from "zod";
import { BadRequestException } from "../exceptions/bad-request.exception";

export async function validateRequest<T extends ZodObject>(
  req: NextRequest,
  schema: T,
): Promise<z.infer<typeof schema>> {
  const body = await req.json();
  const result = await schema.safeParseAsync(body);

  if (!result.success) {
    const test = Object.entries(treeifyError(result.error).properties ?? {})
      .map(([field, error]) => `${field}: ${error?.errors.join(", ")}`)
      .join(". ");

    throw new BadRequestException(test);
  }

  return result.data;
}
