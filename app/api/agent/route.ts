import { AgentRequest, AgentResponse } from "@/app/types/api";
import { NextResponse } from "next/server";
import { createAgent } from "./create-agent";
/**
 * Handles incoming POST requests to interact with the AgentKit-powered AI agent.
 * This function processes user messages and streams responses from the agent.
 *
 * @function POST
 * @param {Request & { json: () => Promise<AgentRequest & { apiKeys?: any }> }} req - The incoming request object containing the user message and API keys.
 * @returns {Promise<NextResponse<AgentResponse>>} JSON response containing the AI-generated reply or an error message.
 *
 * @description Sends a single message to the agent and returns the agents' final response.
 *
 * @example
 * const response = await fetch("/api/agent", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ userMessage: input, apiKeys: { openaiKey: "...", cdpApiFile: "...", networkId: "..." } }),
 * });
 */
export async function POST(
  req: Request & { json: () => Promise<AgentRequest & { apiKeys?: any }> },
): Promise<NextResponse<AgentResponse>> {
  try {
    // 1️. Extract user message and API keys from the request body
    const { userMessage, apiKeys } = await req.json();

    if (!apiKeys) {
      return NextResponse.json({
        error: "API keys are required. Please configure your API keys first."
      });
    }

    if (!apiKeys.openaiKey || !apiKeys.cdpApiFile) {
      return NextResponse.json({
        error: "Both OpenAI API key and CDP API file are required."
      });
    }

    // 2. Get the agent with the provided API keys
    const agent = await createAgent(apiKeys);

    // 3.Start streaming the agent's response
    const stream = await agent.stream(
      { messages: [{ content: userMessage, role: "user" }] }, // The new message to send to the agent
      { configurable: { thread_id: "AgentKit Discussion" } }, // Customizable thread ID for tracking conversations
    );

    // 4️. Process the streamed response chunks into a single message
    let agentResponse = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        agentResponse += chunk.agent.messages[0].content;
      }
    }

    // 5️. Return the final response
    return NextResponse.json({ response: agentResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({
      error:
        error instanceof Error
          ? error.message
          : "I'm sorry, I encountered an issue processing your message. Please try again later.",
    });
  }
}
