import "@testing-library/jest-dom";
// useWs.test.ts
import { renderHook, act } from "@testing-library/react";
import useWs from "./use-ws";
import useSession from "./use-session";
import { WsEndpoint, WS_ACTION } from "@/features/aws";
import { WsNotification, WsClientNotification } from "@/features/aws/ws-notification";
import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";

// Mock dependencies
jest.mock("./use-session");
jest.mock("@/features/aws", () => ({
  WS_ACTION: "all",
  WsEndpoint: {
    Connect: "connect",
    Message: "message",
  },
}));
jest.mock("@/features/aws/ws-notification", () => ({
  WsNotification: {
    Message: "message",
  },
}));

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  onopen: null as ((this: WebSocket, ev: Event) => any) | null,
  onmessage: null as ((this: WebSocket, ev: MessageEvent) => any) | null,
  onerror: null as ((this: WebSocket, ev: Event) => any) | null,
  onclose: null as ((this: WebSocket, ev: CloseEvent) => any) | null,
  readyState: WebSocket.OPEN,
};

// Mock global WebSocket
global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock environment variables
process.env.NEXT_PUBLIC_AWS_API_GATEWAY_ID = "test-api-id";
process.env.NEXT_PUBLIC_AWS_REGION = "us-east-1";
process.env.NEXT_PUBLIC_AWS_API_STAGE = "test";

describe("useWs", () => {
  const mockGetOrFail = jest.fn();
  const mockSession: AuthorizeSessionDto = { token: "test-token", username: "testuser" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      getOrFail: mockGetOrFail.mockReturnValue(mockSession),
    });

    // Reset window properties and WebSocket mock
    window.ws = undefined;
    window.wsHandlers = undefined;
    mockWebSocket.send.mockClear();
    mockWebSocket.onopen = null;
    mockWebSocket.onmessage = null;
  });

  test("creates WebSocket connection with correct endpoint on mount", () => {
    renderHook(() => useWs());

    expect(WebSocket).toHaveBeenCalledWith("wss://test-api-id.execute-api.us-east-1.amazonaws.com/test");
    expect(window.ws).toBe(mockWebSocket);
  });

  test("reuses existing WebSocket connection if available", () => {
    // Set up an existing WebSocket
    const existingWebSocket = {} as WebSocket;
    window.ws = existingWebSocket;

    renderHook(() => useWs());

    expect(WebSocket).not.toHaveBeenCalled();
    expect(window.ws).toBe(existingWebSocket);
  });

  test("sends connect message with session data on WebSocket open", () => {
    renderHook(() => useWs());

    // Trigger the onopen event
    act(() => {
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event("open"));
      }
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        endpoint: WsEndpoint.Connect,
        action: WS_ACTION,
        ...mockSession,
      }),
    );
  });

  test("send function formats and sends data correctly", () => {
    const { result } = renderHook(() => useWs());

    const messageData = { content: "Hello", to: "user2" };
    act(() => {
      result.current.send(WsEndpoint.Message, { ...messageData, ...mockSession });
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        endpoint: WsEndpoint.Message,
        action: WS_ACTION,
        ...messageData,
        ...mockSession,
      }),
    );
  });

  test("addMessageHandler registers and properly removes handlers", () => {
    const { result } = renderHook(() => useWs());

    const mockHandler1 = jest.fn();
    const mockHandler2 = jest.fn();

    // Add handlers
    const removeHandler1 = act(() => result.current.addMessageHandler(WsNotification.Message, mockHandler1));
    const removeHandler2 = act(() => result.current.addMessageHandler(WsNotification.Message, mockHandler2));

    // Verify handlers were added
    expect(window.wsHandlers?.[WsNotification.Message]).toHaveLength(2);
    expect(window.wsHandlers?.[WsNotification.Message]).toContain(mockHandler1);
    expect(window.wsHandlers?.[WsNotification.Message]).toContain(mockHandler2);

    // Remove first handler
    act(() => removeHandler1());
    expect(window.wsHandlers?.[WsNotification.Message]).toHaveLength(1);
    expect(window.wsHandlers?.[WsNotification.Message]).not.toContain(mockHandler1);

    // Remove second handler
    act(() => removeHandler2());
    expect(window.wsHandlers?.[WsNotification.Message]).toHaveLength(0);
  });

  test("handles incoming WebSocket messages and routes to correct handlers", () => {
    const { result } = renderHook(() => useWs());

    const mockHandler = jest.fn();
    const testMessage: WsClientNotification = {
      event: WsNotification.Message,
      body: {
        content: "Hello",
        from: "user2",
        timestamp: "2023-01-01T10:00:00Z",
      },
    };

    // Add handler
    act(() => {
      result.current.addMessageHandler(WsNotification.Message, mockHandler);
    });

    // Trigger the onmessage event
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify(testMessage),
        } as MessageEvent);
      }
    });

    expect(mockHandler).toHaveBeenCalledWith(testMessage.body);
  });

  test("ignores messages with no registered handlers", () => {
    renderHook(() => useWs());

    const testMessage: WsClientNotification = {
      event: WsNotification.Message,
      body: {
        content: "Hello",
        from: "user2",
        timestamp: "2023-01-01T10:00:00Z",
      },
    };

    // Trigger the onmessage event without any handlers
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify(testMessage),
        } as MessageEvent);
      }
    });

    // Should not crash and handlers should be undefined
    expect(window.wsHandlers?.[WsNotification.Message]).toBeUndefined();
  });

  test("handles malformed JSON messages gracefully", () => {
    renderHook(() => useWs());

    // Add a handler to ensure it's not called
    const mockHandler = jest.fn();
    act(() => {
      if (window.wsHandlers) {
        window.wsHandlers[WsNotification.Message] = [mockHandler];
      }
    });

    // Trigger the onmessage event with invalid JSON
    act(() => {
      if (mockWebSocket.onmessage) {
        expect(() => {
          mockWebSocket.onmessage({
            data: "invalid-json",
          } as MessageEvent);
        }).not.toThrow();
      }
    });

    // Handler should not be called with malformed data
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test("handles WebSocket errors gracefully", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useWs());

    // Trigger the onerror event
    act(() => {
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event("error"));
      }
    });

    // Should not crash
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test("handles WebSocket closure gracefully", () => {
    renderHook(() => useWs());

    // Trigger the onclose event
    act(() => {
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent("close"));
      }
    });

    // Should not crash
    expect(window.ws).toBeDefined();
  });

  test("cleanup function does not interfere with existing WebSocket", () => {
    const { unmount } = renderHook(() => useWs());

    // Store reference to the WebSocket
    const wsInstance = window.ws;

    // Unmount the component
    unmount();

    // WebSocket should still exist
    expect(window.ws).toBe(wsInstance);
  });
});
