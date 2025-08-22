import { WsMessageNotificationDto } from "./message-notification.dto";

export enum WsNotification {
  Message = "message",
}

export type WsNotificationPayload = {
  [WsNotification.Message]: WsMessageNotificationDto;
};

export type WsClientNotification = {
  [K in keyof WsNotificationPayload]: {
    event: K;
    body: WsNotificationPayload[K];
  };
}[keyof WsNotificationPayload];

export function getEvenBuffer<T extends WsNotification>(event: T, body: WsNotificationPayload[T]) {
  return Buffer.from(JSON.stringify({ event, body }));
}
