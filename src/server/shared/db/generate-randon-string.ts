import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import { randomBytes } from "crypto";

export function generateRandomString() {
  return randomBytes(Math.ceil(MAX_SHORT_VARCHAR / 2)).toString("hex");
}
