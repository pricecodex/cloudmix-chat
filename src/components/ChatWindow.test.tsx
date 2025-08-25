import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWindow from "./ChatWindow";
import { Chat, Message } from "@/types/chat";

// Mock the scrollTo method
const mockScrollTo = jest.fn();
HTMLDivElement.prototype.scrollTo = mockScrollTo;

describe("ChatWindow", () => {
  const mockChats: Chat[] = [
    {
      chatId: "1",
      username: "user1",
      lastMessage: "Hello there",
      lastMessageDate: "2023-01-01T10:00:00Z",
      isOnline: true,
    },
    {
      chatId: "2",
      username: "user2",
      lastMessage: "How are you?",
      lastMessageDate: "2023-01-02T11:00:00Z",
      isOnline: false,
    },
  ];

  const mockMessages: Message[] = [
    {
      text: "Hello!",
      isMine: false,
      createdAt: "2023-01-01T10:00:00Z",
    },
    {
      text: "Hi there!",
      isMine: true,
      createdAt: "2023-01-01T10:01:00Z",
    },
  ];

  const mockSetNewMessage = jest.fn();
  const mockSendMessage = jest.fn();
  const mockCloseChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders placeholder when no active chat is selected", () => {
    render(
      <ChatWindow
        activeChat={null}
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    expect(screen.getByText("Select a chat to start messaging")).toBeInTheDocument();
    expect(screen.getByText("Select a chat to start messaging")).toHaveClass("hidden", "md:flex");
  });

  test("renders chat window when active chat is selected", () => {
    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a message ...")).toBeInTheDocument();
    expect(screen.getByText("➤")).toBeInTheDocument();
  });

  test("displays online status correctly", () => {
    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    expect(screen.getByText("Online")).toBeInTheDocument();

    // Test offline status
    render(
      <ChatWindow
        activeChat="2"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  test("displays messages with correct styling", () => {
    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const myMessage = screen.getByText("Hi there!").closest("div");
    const theirMessage = screen.getByText("Hello!").closest("div");

    expect(myMessage).toHaveClass("ml-auto", "bg-secondary", "text-white");
    expect(theirMessage).toHaveClass("bg-white");
  });

  test("calls setNewMessage when input changes", async () => {
    const user = userEvent.setup();

    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const input = screen.getByPlaceholderText("Write a message ...");
    await user.type(input, "Hello world");

    expect(mockSetNewMessage).toHaveBeenCalledTimes("Hello world".length);
  });

  test("calls sendMessage when Enter key is pressed", async () => {
    const user = userEvent.setup();

    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage="Test message"
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const input = screen.getByPlaceholderText("Write a message ...");
    await user.type(input, "{enter}");

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  test("calls sendMessage when send button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage="Test message"
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const sendButton = screen.getByText("➤");
    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  test("calls closeChat when back button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const backButton = screen.getByText("← Back");
    await user.click(backButton);

    expect(mockCloseChat).toHaveBeenCalledTimes(1);
  });

  test("back button is only visible on mobile", () => {
    render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    const backButton = screen.getByText("← Back");
    expect(backButton).toHaveClass("md:hidden");
  });

  test("scrolls to bottom when messages change", async () => {
    const { rerender } = render(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    // Wait for the scroll effect to be called
    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    // Clear the mock to track new calls
    mockScrollTo.mockClear();

    // Update with new messages
    const newMessages = [
      ...mockMessages,
      {
        text: "New message!",
        isMine: false,
        timestamp: "2023-01-01T10:02:00Z",
      },
    ];

    rerender(
      <ChatWindow
        activeChat="1"
        chats={mockChats}
        messages={newMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    // Wait for the scroll effect to be called again
    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });
  });

  test("does not scroll when there's no active chat", () => {
    render(
      <ChatWindow
        activeChat={null}
        chats={mockChats}
        messages={mockMessages}
        newMessage=""
        setNewMessage={mockSetNewMessage}
        sendMessage={mockSendMessage}
        closeChat={mockCloseChat}
      />,
    );

    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
