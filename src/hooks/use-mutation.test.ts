import { renderHook, act } from "@testing-library/react";
import useMutation from "./use-mutation";
import useApi from "./use-api";
import { z } from "zod";

// Mock the useApi hook
jest.mock("./use-api");

describe("useMutation", () => {
  // Test schema
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
  });

  type TestData = z.infer<typeof testSchema>;
  type TestResponse = { id: string; name: string; email: string };

  const mockRequest = jest.fn();
  const initialFormData: TestData = { name: "", email: "" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
  });

  test("should initialize with provided form data and empty errors", () => {
    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData: initialFormData,
        path: "/test",
      }),
    );

    expect(result.current.formData).toEqual(initialFormData);
    expect(result.current.errors).toEqual({});
  });

  test("should update form data with setFormData", () => {
    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData: initialFormData,
        path: "/test",
      }),
    );

    const newData = { name: "John", email: "john@example.com" };

    act(() => {
      result.current.setFormData(newData);
    });

    expect(result.current.formData).toEqual(newData);
  });

  test("should set errors and return isValid=false when validation fails", async () => {
    const validationErrors = {
      name: "Name is required",
      email: "Invalid email",
    };

    mockRequest.mockResolvedValue({
      errors: validationErrors,
      result: null,
    });

    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData: initialFormData,
        path: "/test",
      }),
    );

    const mutationResult = await act(async () => {
      return result.current.mutate();
    });

    expect(mutationResult.isValid).toBe(false);
    expect(mutationResult.result).toBeNull();
    expect(result.current.errors).toEqual(validationErrors);
  });

  test("should clear errors and return isValid=true with result when successful", async () => {
    const responseData = { id: "123", name: "John", email: "john@example.com" };

    mockRequest.mockResolvedValue({
      errors: {},
      result: responseData,
    });

    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData: { name: "John", email: "john@example.com" },
        path: "/test",
      }),
    );

    // First set some errors to ensure they get cleared
    const validationErrors = {
      name: "Name is required",
    };
    mockRequest.mockResolvedValueOnce({
      errors: validationErrors,
      result: null,
    });

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.errors).toEqual(validationErrors);

    // Now test successful mutation
    mockRequest.mockResolvedValue({
      errors: {},
      result: responseData,
    });

    const mutationResult = await act(async () => {
      return result.current.mutate();
    });

    expect(mutationResult.isValid).toBe(true);
    expect(mutationResult.result).toEqual(responseData);
  });

  test("should call useApi.request with correct parameters", async () => {
    const formData = { name: "John", email: "john@example.com" };
    const responseData = { id: "123", ...formData };

    mockRequest.mockResolvedValue({
      errors: {},
      result: responseData,
    });

    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData,
        path: "/test",
      }),
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(mockRequest).toHaveBeenCalledWith({
      path: "/test",
      schema: testSchema,
      formData,
    });
  });

  test("should handle request without errors property", async () => {
    const responseData = { id: "123", name: "John", email: "john@example.com" };

    mockRequest.mockResolvedValue({
      result: responseData,
    });

    const { result } = renderHook(() =>
      useMutation<typeof testSchema, TestResponse>({
        schema: testSchema,
        formData: { name: "John", email: "john@example.com" },
        path: "/test",
      }),
    );

    const mutationResult = await act(async () => {
      return result.current.mutate();
    });

    expect(mutationResult.isValid).toBe(true);
    expect(mutationResult.result).toEqual(responseData);
    expect(result.current.errors).toEqual({});
  });
});
