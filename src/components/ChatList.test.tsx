import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatList from "./ChatList";
import { Chat } from "@/types/chat";

// Mock the formatTime utility
jest.mock("@/utils/date", () => ({
  formatTime: jest.fn().mockImplementation((date) => `formatted:${date}`),
}));

describe("ChatList", () => {
  const mockChats: Chat[] = [
    {
      chatId: "1",
      username: "user1",
      lastMessage: "Hello there",
      lastMessageDate: "2023-01-01T10:00:00Z",
      isOnline: false,
    },
    {
      chatId: "2",
      username: "user2",
      lastMessage: "How are you?",
      lastMessageDate: "2023-01-02T11:00:00Z",
      isOnline: false,
    },
  ];

  const mockSetActiveChat = jest.fn();
  const mockOpenModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the correct number of chats", () => {
    render(
      <ChatList chats={mockChats} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    expect(screen.getByText(`Messages (${mockChats.length})`)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(mockChats.length);
  });

  test("renders chat information correctly", () => {
    render(
      <ChatList chats={mockChats} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    // Check if all usernames are rendered
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();

    // Check if all last messages are rendered
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();

    // Check if formatted time is displayed
    expect(screen.getByText("formatted:2023-01-01T10:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("formatted:2023-01-02T11:00:00Z")).toBeInTheDocument();
  });

  test("highlights active chat", () => {
    render(<ChatList chats={mockChats} activeChat="1" setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />);

    const activeChatItem = screen.getByText("user1").closest("li");
    expect(activeChatItem).toHaveClass("bg-gray-200");
  });

  test("calls setActiveChat when a chat is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ChatList chats={mockChats} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    const firstChat = screen.getByText("user1").closest("li");
    await user.click(firstChat!);

    expect(mockSetActiveChat).toHaveBeenCalledWith("1");
  });

  test("calls openModal when 'Find user' button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ChatList chats={mockChats} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    const findUserButton = screen.getByText("Find user");
    await user.click(findUserButton);

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  test("hides on small screens when activeChat is set", () => {
    const { container } = render(
      <ChatList chats={mockChats} activeChat="1" setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    const asideElement = container.querySelector("aside");
    expect(asideElement).toHaveClass("hidden", "md:block");
  });

  test("shows on all screens when no activeChat is set", () => {
    const { container } = render(
      <ChatList chats={mockChats} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />,
    );

    const asideElement = container.querySelector("aside");
    expect(asideElement).not.toHaveClass("hidden");
  });

  test("handles empty chats array", () => {
    render(<ChatList chats={[]} activeChat={null} setActiveChat={mockSetActiveChat} openModal={mockOpenModal} />);

    expect(screen.getByText("Messages (0)")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
