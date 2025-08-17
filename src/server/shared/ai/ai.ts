import OpenAI from "openai";

export const AI_USERNAME = "@ai-chat@";

export const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
