// src/api/aiApi.ts
import axiosInstance from "../libs/axiosInstance";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  modelUsed?: string;
  toolCalled?: string;
}

export const aiApi = {
  chat: (message: string, history: ChatMessage[] = []) =>
    axiosInstance.post("/ai/chat", { message, history }, { timeout: 90000 }),
  getSuggestions: () =>
    axiosInstance.get("/ai/suggestions", { timeout: 20000 }),
};

export default aiApi;
