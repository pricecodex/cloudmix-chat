"use client";

import { WS_ACTION, WsEndpoint } from "@/features/aws";
import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("loginData") || "");
    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_AWS_API_GATEWAY_ID}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_API_STAGE}`,
    );

    ws.onopen = () => {
      console.log("Connected");

      ws.send(JSON.stringify({ action: WS_ACTION, endpoint: WsEndpoint.Connect, ...loginData }));

      window.sendTo = (to: string, message: string) => {
        ws.send(
          JSON.stringify({ ...loginData, action: WS_ACTION, endpoint: WsEndpoint.Message, content: message, to }),
        );
      };
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
    };

    ws.onclose = () => console.log("Disconnected");

    ws.onerror = (err) => console.error("Error:", err);

    window.doSome = async () => {
      const res = await fetch(
        "/api/chats/6b11d7907f2b49e54f3c2682132c9a02aa1e7b08bdd0258bd7df47b758590d8f3a53015bf4eb8d315d2f9bf3689551734db964c947d6a8c6386f651b8eecd064a6c8a53f86274458723e37ab5ca4056f5401eab2aeb3bef14986bbda70f9cda03b2df5ae5bfcfa867c6ed215977dc03930bca925d502bfee822ee6ed7e74b7904226f4f83a0554433ca8a88fd8067de8369ded8874910d9766e6ba748722a81ffd6a2ab461ea81dff855c5e2c22e856e5e4d0d46988e56f8ab40f4fd4e50ee00f7517927905a3dd6fdb46dc20ff9e400f196d5289ea15a537b207a67d5e14652a46bb14c753f92eeea971f1f68998add306df7625316b993bbd2ddbb73221dfb",
        {
          method: "POST",
          body: JSON.stringify(loginData),
        },
      );
      const data = await res.json();
      console.log(data);
    };

    window.askBot = async (question: string) => {
      const res = await fetch("/api/chats/ai", {
        method: "POST",
        body: JSON.stringify({ ...loginData, question }),
      });
      const { data } = await res.json();
      console.log("data", data);
    };
  }, []);

  return null;
};

export default Page;
