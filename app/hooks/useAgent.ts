import { useState } from "react";
import { AgentRequest, AgentResponse } from "../types/api";

/**
 * Sends a user message to the AgentKit backend API and retrieves the agent's response.
 *
 * @async
 * @function callAgentAPI
 * @param {string} userMessage - The message sent by the user.
 * @param {any} apiKeys - The API keys to use for the request.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 *
 * @throws {Error} Logs an error if the request fails.
 */
async function messageAgent(userMessage: string, apiKeys?: any): Promise<string | null> {
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, apiKeys } as AgentRequest & { apiKeys?: any }),
    });

    const data = (await response.json()) as AgentResponse;
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return null;
  }
}

/**
 *
 * This hook manages interactions with the AI agent by making REST calls to the backend.
 * It also stores the local conversation state, tracking messages sent by the user and
 * responses from the agent.
 *
 * #### How It Works
 * - `sendMessage(input)` sends a message to `/api/agent` and updates state.
 * - `messages` stores the chat history.
 * - `isThinking` tracks whether the agent is processing a response.
 * - `setApiKeys` allows setting API keys for authentication.
 *
 * #### See Also
 * - The API logic in `/api/agent.ts`
 *
 * @returns {object} An object containing:
 * - `messages`: The conversation history.
 * - `sendMessage`: A function to send a new message.
 * - `isThinking`: Boolean indicating if the agent is processing a response.
 * - `setApiKeys`: Function to set the API keys.
 */
export function useAgent() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "agent" }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [apiKeys, setApiKeysState] = useState<any>(null);

  /**
   * Sets the API keys for the agent.
   *
   * @param {any} keys - The API keys object.
   */
  const setApiKeys = (keys: any) => {
    setApiKeysState(keys);
  };

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    const responseMessage = await messageAgent(input, apiKeys);

    if (responseMessage) {
      setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
    }

    setIsThinking(false);
  };

  return { messages, sendMessage, isThinking, setApiKeys };
}
