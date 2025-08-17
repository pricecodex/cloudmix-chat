import { GoogleGenAI } from "@google/genai";

export const AI_USERNAME = "@ai-chat@";
export const AI_DEFAULT_MESSAGE = "Hey There!";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
