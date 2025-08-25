import { renderHook } from "@testing-library/react";
import useApi from "./use-api";
import useSession from "./use-session";
import { toast } from "sonner";
import { z } from "zod";

// Mock dependencies
jest.mock("./use-session");
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Test schema
const testSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
});

describe("useApi", () => {
  const mockSession = {
    token: "test-token",
    username: "testuser",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(mockSession),
    });
  });

  test("should validate form data with schema and return errors", async () => {
    const { result } = renderHook(() => useApi());
    const invalidFormData = { username: "", email: "invalid-email" };

    const response = await result.current.request({
      schema: testSchema,
      formData: invalidFormData,
      path: "/test",
    });

    expect(response.result).toBeNull();
    expect(response.errors).toEqual({
      username: "Username is required",
      email: "Invalid email",
    });
  });

  test("should include session data in request when formData is provided", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "success" }),
    });

    const { result } = renderHook(() => useApi());
    const validFormData = { username: "testuser", email: "test@example.com" };

    await result.current.request({
      schema: testSchema,
      formData: validFormData,
      path: "/test",
    });

    expect(fetch).toHaveBeenCalledWith("/test", {
      method: "POST",
      body: JSON.stringify({ ...mockSession, ...validFormData }),
    });
  });

  test("should include only session data when no formData is provided", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "success" }),
    });

    const { result } = renderHook(() => useApi());

    await result.current.request({
      path: "/test",
    });

    expect(fetch).toHaveBeenCalledWith("/test", {
      method: "POST",
      body: JSON.stringify(mockSession),
    });
  });

  test("should return result on successful response", async () => {
    const mockData = { id: 1, name: "Test" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockData }),
    });

    const { result } = renderHook(() => useApi());

    const response = await result.current.request({
      path: "/test",
    });

    expect(response.result).toEqual(mockData);
    expect(response.errors).toBeUndefined();
  });

  test("should show error toast and return null result on failed response", async () => {
    const errorMessage = "Something went wrong";
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: errorMessage }),
    });

    const { result } = renderHook(() => useApi());

    const response = await result.current.request({
      path: "/test",
    });

    expect(response.result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  test("should work without schema validation", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "success" }),
    });

    const { result } = renderHook(() => useApi());

    const response = await result.current.request({
      path: "/test",
    });

    expect(response.result).toBe("success");
    expect(response.errors).toBeUndefined();
  });
});
