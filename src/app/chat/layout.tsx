import Header from "@/components/Header";

interface ChatLayoutInterface {
  children: React.ReactNode;
}

function ChatLayout({ children }: ChatLayoutInterface) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default ChatLayout;
