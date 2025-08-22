export function truncate(msg: string, limit: number): string {
  return msg.length > limit ? msg.slice(0, limit) + "…" : msg;
}
