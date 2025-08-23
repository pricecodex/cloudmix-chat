"use client";

import clsx from "clsx";
import z from "zod";

import useMutation from "@/hooks/use-mutation";
import { ApiRoute } from "@/types/route";

import { sessionUsernameDto } from "@/entities/session/dtos/find-session.dto";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import { string } from "@/server/shared/schema/string";
import { toast } from "sonner";

interface MessageModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface CreateChatResponse {
  message: string;
  data: {
    chatId: string;
    lastMessageDate: string;
    lastMessage: string;
    toUser: string;
  };
}

const createChatDto = z.object({
  to: sessionUsernameDto,
  message: string.max(MAX_LONG_VARCHAR),
});

export default function MessageModal({ isOpen, setIsOpen }: MessageModalProps) {
  const {
    mutate: sendMessage,
    formData,
    setFormData,
    errors,
  } = useMutation<typeof createChatDto, CreateChatResponse>({
    schema: createChatDto,
    path: ApiRoute.InitChat,
    formData: { message: "", to: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSend = async () => {
    const { isValid, result } = await sendMessage();
    if (isValid && result) {
      setIsOpen(false);
      toast.success("Message sent succesfully");
      return result;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Send a Message</h2>

            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="Username"
              className={clsx(
                "w-full rounded-lg border border-gray-300 px-4 py-2",
                "placeholder:text-gray-400 focus:border-purple-500 focus:outline-none",
              )}
            />
            {errors.to && <p className="mt-1 text-sm text-red-500">{errors.to}</p>}

            <textarea
              value={formData.message}
              name="message"
              onChange={handleChange}
              placeholder="Write your message..."
              rows={4}
              className={clsx(
                "mt-3 w-full rounded-lg border border-gray-300 px-4 py-2",
                "placeholder:text-gray-400 focus:border-purple-500 focus:outline-none",
              )}
            />
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}

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
