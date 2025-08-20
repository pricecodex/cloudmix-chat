"use client";

import { useState } from "react";
import clsx from "clsx";

interface MessageModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MessageModal({ isOpen, setIsOpen }: MessageModalProps) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!username || !message) return;
    console.log("Send:", { username, message });
    setIsOpen(false);
    setUsername("");
    setMessage("");
    const loginData = JSON.parse(localStorage.getItem("loginData") || "");

    const res = await fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({ ...loginData, to: username, message }),
    });
    const { data } = await res.json();
    console.log("data", data);
    return data;
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Send a Message</h2>

            {/* Username */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className={clsx(
                "w-full rounded-lg border border-gray-300 px-4 py-2",
                "placeholder:text-gray-400 focus:border-purple-500 focus:outline-none",
              )}
            />

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className={clsx(
                "mt-3 w-full rounded-lg border border-gray-300 px-4 py-2",
                "placeholder:text-gray-400 focus:border-purple-500 focus:outline-none",
              )}
            />

            {/* Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="bg-secondary rounded-lg px-4 py-2 text-white shadow hover:bg-purple-400"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
