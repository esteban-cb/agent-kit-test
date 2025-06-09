import { AgentRequest, AgentResponse, ApiKeys } from "@/app/types/api";
import { NextResponse } from "next/server";
import { createAgent } from "./create-agent";
/**
 * Handles incoming POST requests to interact with the AgentKit-powered AI agent.
 * This function processes user messages and streams responses from the agent.
 *
 * @function POST
 * @param {Request} req - The incoming request object containing the user message and API keys.
 * @returns {Promise<NextResponse<AgentResponse>>} JSON response containing the AI-generated reply or an error message.
 *
 * @description Sends a single message to the agent and returns the agents' final response.
 *
 * @example
 * const response = await fetch("/api/agent", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ userMessage: input, apiKeys: { openaiKey: "...", cdpApiKeyName: "...", cdpPrivateKey: "...", networkId: "..." } }),
 * });
 */
export async function POST(req: Request): Promise<NextResponse<AgentResponse>> {
  console.log("POST /api/agent called");
  
  try {
    // 1. Extract user message and API keys from the request body
    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body parsed successfully");
    
    const { userMessage, apiKeys } = body as AgentRequest & { apiKeys?: ApiKeys };

    if (!apiKeys) {
      console.log("No API keys provided");
      return NextResponse.json({
        error: "API keys are required. Please configure your API keys first."
      }, { status: 400 });
    }

    if (!apiKeys.openaiKey || !apiKeys.cdpApiKeyName || !apiKeys.cdpPrivateKey) {
      console.log("Missing required API keys");
      return NextResponse.json({
        error: "OpenAI API key, CDP API key name, and CDP private key are required."
      }, { status: 400 });
    }

    console.log("Creating agent...");
    // 2. Get the agent with the provided API keys
    const agent = await createAgent(apiKeys);
    console.log("Agent created successfully");

    console.log("Starting agent stream...");
    // 3. Start streaming the agent's response
    const stream = await agent.stream(
      { messages: [{ content: userMessage, role: "user" }] }, // The new message to send to the agent
      { configurable: { thread_id: "AgentKit Discussion" } }, // Customizable thread ID for tracking conversations
    );

    console.log("Processing stream chunks...");
    // 4. Process the streamed response chunks into a single message
    let agentResponse = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        agentResponse += chunk.agent.messages[0].content;
      }
    }

    console.log("Returning response:", agentResponse.substring(0, 100) + "...");
    // 5. Return the final response
    return NextResponse.json({ response: agentResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : "I'm sorry, I encountered an issue processing your message. Please try again later.",
    }, { status: 500 });
  }
}

// Handle GET requests (for debugging)
export async function GET() {
  console.log("GET /api/agent called");
  return NextResponse.json({ 
    message: "AgentKit API is running. Use POST to interact with the agent.",
    timestamp: new Date().toISOString()
  });
}

// Force deployment refresh
