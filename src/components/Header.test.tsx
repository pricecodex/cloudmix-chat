import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "./Header";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, width, height }: any) {
    return <img src={src} alt={alt} width={width} height={height} />;
  };
});

describe("Header", () => {
  const mockHandleLogout = jest.fn();
  const username = "testuser";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders logo with correct attributes", () => {
    render(<Header username={username} handleLogout={mockHandleLogout} />);

    const logo = screen.getByAltText("Cloudmix Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/assets/logos/cloudmix.svg");
    expect(logo).toHaveAttribute("width", "146");
    expect(logo).toHaveAttribute("height", "42");
  });

  test("displays the correct username", () => {
    render(<Header username={username} handleLogout={mockHandleLogout} />);

    expect(screen.getByText(username)).toBeInTheDocument();
  });

  test("renders logout button", () => {
    render(<Header username={username} handleLogout={mockHandleLogout} />);

    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass("hover:underline");
  });

  test("calls handleLogout when logout button is clicked", () => {
    render(<Header username={username} handleLogout={mockHandleLogout} />);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });

  test("applies correct styling classes", () => {
    render(<Header username={username} handleLogout={mockHandleLogout} />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("border-divider", "flex", "justify-between", "border-b", "bg-white", "px-6", "py-4.5");

    const usernameElement = screen.getByText(username);
    expect(usernameElement).toHaveClass("text-lg", "font-medium");

    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toHaveClass("inline-flex", "self-end", "text-base", "font-normal", "hover:underline");
  });

  test("renders with different username", () => {
    const differentUsername = "anotheruser";
    render(<Header username={differentUsername} handleLogout={mockHandleLogout} />);

    expect(screen.getByText(differentUsername)).toBeInTheDocument();
  });
});
