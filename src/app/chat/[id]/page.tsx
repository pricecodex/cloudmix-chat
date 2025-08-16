"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const mockMessages = {
  "1": [
    { from: "Aslan", text: "Yo Samurai, me and pokemon head will going to Dostyk, will u join?" },
    { from: "You", text: "Okay what exactly we're doing there?" },
    { from: "You", text: "First of all, could we have a snack at Memo's" },
    { from: "Aslan", text: "We'll have to look for a gift for Alina" },
  ],
  "2": [{ from: "Moana", text: "Yo bro I got some info for you" }],
  "3": [{ from: "Dragon Love", text: "Send nuds" }],
};

export default function ChatWindowPage() {
  const { id } = useParams();
  const messages = mockMessages[id as keyof typeof mockMessages] || [];
  const [input, setInput] = useState("");

  const handleSend = () => {
    console.log("Send:", input);
    setInput("");
  };

  return (
    <div className="flex h-screen flex-col p-4">
      <header className="mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold">Chat {id}</h2>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xs rounded-lg p-2 ${
              msg.from === "You" ? "ml-auto bg-purple-500 text-white" : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <footer className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="Write a message..."
        />
        <button onClick={handleSend} className="rounded-lg bg-purple-500 px-4 py-2 text-white">
          Send
        </button>
      </footer>
    </div>
  );
}
