import { WsMessageNotificationDto } from "./message-notification.dto";

export enum WsNotification {
  Message = "message",
}

type WS_NOTIFICATIONS = {
  [WsNotification.Message]: WsMessageNotificationDto;
};

export function getEvenBuffer<T extends WsNotification>(event: T, body: WS_NOTIFICATIONS[T]) {
  return Buffer.from(JSON.stringify({ event, body }));
}
