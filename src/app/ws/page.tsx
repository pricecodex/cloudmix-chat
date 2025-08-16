"use client";

import { WS_ACTION, WsEndpoint } from "@/features/aws";
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
          action: WS_ACTION,
          endpoint: WsEndpoint.Connect,
          token:
            "e8b4cf8cdc76e89a079f9ce43194bb5b56bfceff6a0f63cf2ac06d6f51e6a64d6eb62bfc900a08a9776b9311d3c5add1edae369e83525251066e15ad3ab7b431f49f99b33bc2045864ce15a4ad347eae30fd378c8e74e512713cd3799436f4910de1cdfa5a507d4a89f85ed868904f3b5ac6a7410df530d91f151fa1775b0577f6477705b134da73a84cbe59a1cd93040e98d3d4d0735edf7034f4cb059f76538a9bec9b2a83225fd020b9409bcc7d27552a1fb20215d2c64da469df7c7ce585bfee042cddf43072efdc2c0ebf3b51b17d0472c542f1d0b6c8aa2594f15e4ef6ee2f22cedb9b133f3267d0878518d1ff43be035971ecdbd215d8bd5004a8fe21",
          username: "test",
        }),
      );

      ws.send(
        JSON.stringify({
          action: WS_ACTION,
          endpoint: WsEndpoint.Message,
          content: "MESSAGE",
          to: "test1",
          token:
            "e8b4cf8cdc76e89a079f9ce43194bb5b56bfceff6a0f63cf2ac06d6f51e6a64d6eb62bfc900a08a9776b9311d3c5add1edae369e83525251066e15ad3ab7b431f49f99b33bc2045864ce15a4ad347eae30fd378c8e74e512713cd3799436f4910de1cdfa5a507d4a89f85ed868904f3b5ac6a7410df530d91f151fa1775b0577f6477705b134da73a84cbe59a1cd93040e98d3d4d0735edf7034f4cb059f76538a9bec9b2a83225fd020b9409bcc7d27552a1fb20215d2c64da469df7c7ce585bfee042cddf43072efdc2c0ebf3b51b17d0472c542f1d0b6c8aa2594f15e4ef6ee2f22cedb9b133f3267d0878518d1ff43be035971ecdbd215d8bd5004a8fe21",
          username: "test",
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
