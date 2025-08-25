import { renderHook, act } from "@testing-library/react";
import useSession from "./use-session";
import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useSession", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test("set stores data in localStorage", () => {
    const { result } = renderHook(() => useSession());
    const testData: AuthorizeSessionDto = { username: "testUser", token: "abc123" };

    act(() => {
      result.current.set(testData);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("loginData", JSON.stringify(testData));
  });

  test("remove deletes data from localStorage", () => {
    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.remove();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("loginData");
  });

  test("get returns null when no data exists", () => {
    const { result } = renderHook(() => useSession());

    const session = result.current.get();

    expect(session).toBeNull();
    expect(localStorageMock.getItem).toHaveBeenCalledWith("loginData");
  });

  test("get returns parsed data when exists", () => {
    const testData: AuthorizeSessionDto = { username: "testUser", token: "abc123" };
    localStorageMock.setItem("loginData", JSON.stringify(testData));

    const { result } = renderHook(() => useSession());
    const session = result.current.get();

    expect(session).toEqual(testData);
  });

  test("getOrFail throws error when no session exists", () => {
    const { result } = renderHook(() => useSession());

    expect(() => result.current.getOrFail()).toThrow("Getting a non existing session");
  });

  test("getOrFail returns session data when exists", () => {
    const testData: AuthorizeSessionDto = { username: "testUser", token: "abc123" };
    localStorageMock.setItem("loginData", JSON.stringify(testData));

    const { result } = renderHook(() => useSession());
    const session = result.current.getOrFail();

    expect(session).toEqual(testData);
  });

  test("getUsername returns username from session", () => {
    const testData: AuthorizeSessionDto = { username: "testUser", token: "abc123" };
    localStorageMock.setItem("loginData", JSON.stringify(testData));

    const { result } = renderHook(() => useSession());
    const username = result.current.getUsername();

    expect(username).toBe("testUser");
  });

  test("methods handle undefined window (SSR) correctly", () => {
    const originalWindow = global.window;
    // @ts-expect-error as @ts-ignore
    delete global.window;

    const { result } = renderHook(() => useSession());

    expect(result.current.get()).toBeNull();

    expect(() => result.current.set({ username: "test", token: "123" })).not.toThrow();

    expect(() => result.current.remove()).not.toThrow();

    expect(() => result.current.getUsername()).toThrow();

    // Restore window
    global.window = originalWindow;
  });
});
