"use client";

import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_AWS_API_GATEWAY_ID}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_API_STAGE}`,
    );

    ws.onopen = () => {
      console.log("Connected");
      ws.send(
        JSON.stringify({
          action: "all",
          user: { username: "test", token: "test" },
        }),
      );
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
    };

    ws.onclose = () => console.log("Disconnected");

    ws.onerror = (err) => console.error("Error:", err);
  }, []);

  return null;
};

export default Page;
