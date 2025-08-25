import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import useMutation from "@/hooks/use-mutation";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import MessageModal from "./MessageModal";

// Mock dependencies
jest.mock("@/hooks/use-mutation");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("MessageModal", () => {
  const mockSetIsOpen = jest.fn();
  const mockMutate = jest.fn();
  const mockSetFormData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      formData: { to: "", message: "" },
      setFormData: mockSetFormData,
      errors: {},
    });
  });

  test("does not render when isOpen is false", () => {
    render(<MessageModal isOpen={false} setIsOpen={mockSetIsOpen} />);

    expect(screen.queryByText("Send a Message")).not.toBeInTheDocument();
  });

  test("renders when isOpen is true", () => {
    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(screen.getByText("Send a Message")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write your message...")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  test("updates form data on input change", async () => {
    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    const usernameInput = screen.getByPlaceholderText("Username");
    const messageInput = screen.getByPlaceholderText("Write your message...");

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(messageInput, "Hello, this is a test message");

    expect(mockSetFormData).toHaveBeenCalledTimes("testuser".length + "Hello, this is a test message".length);
  });

  test("displays validation errors", () => {
    (useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockMutate,
      formData: { to: "", message: "" },
      setFormData: mockSetFormData,
      errors: { to: "Username is required", message: "Message is required" },
    });

    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
  });

  test("calls setIsOpen with false when Cancel button is clicked", async () => {
    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  test("successfully sends message and shows success toast", async () => {
    const mockResult = {
      data: {
        chatId: "123",
        lastMessageDate: "2023-01-01",
        lastMessage: "Hello",
        toUser: "testuser",
      },
    };

    mockMutate.mockResolvedValueOnce({
      isValid: true,
      result: mockResult,
    });

    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    const sendButton = screen.getByText("Send");
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      expect(toast.success).toHaveBeenCalledWith("Message sent succesfully");
    });
  });

  test("does not close modal or show success toast when message sending fails", async () => {
    mockMutate.mockResolvedValueOnce({
      isValid: false,
      result: null,
    });

    render(<MessageModal isOpen={true} setIsOpen={mockSetIsOpen} />);

    const sendButton = screen.getByText("Send");
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockSetIsOpen).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
