import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";
import { WS_ACTION, WsEndpoint } from "@/features/aws";
import { WsClientNotification, WsNotification, WsNotificationPayload } from "@/features/aws/ws-notification";
import { useEffect } from "react";
import useSession from "./use-session";

const WS_ENDPOINT = `wss://${process.env.NEXT_PUBLIC_AWS_API_GATEWAY_ID}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_API_STAGE}`;

export type WsEndpointPayload = {
  [WsEndpoint.Connect]: {};
  [WsEndpoint.Message]: { content: string; to: string };
};

type WsNotificationHandler<K extends WsNotification> = (data: WsNotificationPayload[K]) => void;

declare global {
  interface Window {
    ws?: WebSocket;
    wsHandlers?: Partial<{ [K in keyof WsNotificationPayload]: WsNotificationHandler<WsNotification>[] }>;
  }
}

function useWs() {
  const { getOrFail } = useSession();

  function send<T extends WsEndpoint>(endpoint: T, data: WsEndpointPayload[T] & AuthorizeSessionDto) {
    const eventPayload = { endpoint, action: WS_ACTION, ...data };
    window.ws?.send(JSON.stringify(eventPayload));
  }

  function addMessageHandler<T extends WsNotification>(notification: T, handler: WsNotificationHandler<T>) {
    window.wsHandlers?.[notification]?.push(handler as WsNotificationHandler<WsNotification>);
    return function () {
      if (!window.wsHandlers?.[notification]) {
        return;
      }

      window.wsHandlers[notification] = window.wsHandlers[notification].filter((callback) => callback !== handler);
    };
  }

  useEffect(() => {
    if (window.ws) {
      return;
    }

    window.ws = new WebSocket(WS_ENDPOINT);

    window.ws.onopen = () => send(WsEndpoint.Connect, getOrFail());
    window.ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WsClientNotification;

      const typeHandlers = window.wsHandlers?.[message.type] ?? [];

      typeHandlers.forEach((handler) => handler(message.payload));
    };

    return () => {};
  }, []);

  return { send, addMessageHandler };
}

export default useWs;
