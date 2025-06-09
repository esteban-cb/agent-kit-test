import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { prepareAgentkitAndWalletProvider } from "./prepare-agentkit";
import { ApiKeys } from "@/app/types/api";

/**
 * Agent Configuration Guide
 *
 * This file handles the core configuration of your AI agent's behavior and capabilities.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the `ChatOpenAI` instantiation to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

// The agent cache (keyed by a hash of the API keys for security)
const agentCache = new Map<string, ReturnType<typeof createReactAgent>>();

/**
 * Creates a simple hash of the API keys for caching purposes
 */
function hashApiKeys(apiKeys: ApiKeys): string {
  const keyString = `${apiKeys.openaiKey}_${apiKeys.cdpApiFile}_${apiKeys.networkId}`;
  return Buffer.from(keyString).toString('base64').substring(0, 20);
}

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent instance already exists for these API keys, it returns the existing one.
 *
 * @function createAgent
 * @param {ApiKeys} apiKeys - The API keys object containing openaiKey, cdpApiFile, and networkId
 * @returns {Promise<ReturnType<typeof createReactAgent>>} The initialized AI agent.
 *
 * @description Handles agent setup with provided API keys
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function createAgent(apiKeys: ApiKeys): Promise<ReturnType<typeof createReactAgent>> {
  if (!apiKeys) {
    throw new Error("API keys are required to create an agent.");
  }

  const { openaiKey, cdpApiFile, networkId } = apiKeys;

  if (!openaiKey || !cdpApiFile) {
    throw new Error("Both OpenAI API key and CDP API file are required to create an agent.");
  }

  // Check if we already have an agent for these keys
  const keyHash = hashApiKeys(apiKeys);
  if (agentCache.has(keyHash)) {
    return agentCache.get(keyHash)!;
  }

  try {
    console.log("Preparing AgentKit and wallet provider...");
    const { agentkit, walletProvider } = await prepareAgentkitAndWalletProvider(apiKeys);
    console.log("AgentKit and wallet provider prepared successfully");

    // Initialize LLM with the provided OpenAI API key
    console.log("Initializing OpenAI LLM...");
    const llm = new ChatOpenAI({ 
      model: "gpt-4o-mini",
      apiKey: openaiKey
    });
    console.log("OpenAI LLM initialized successfully");

    console.log("Getting AgentKit tools...");
    const tools = await getLangChainTools(agentkit);
    console.log(`Got ${tools.length} tools from AgentKit`);

    const memory = new MemorySaver();

    // Initialize Agent
    const canUseFaucet = walletProvider.getNetwork().networkId == "base-sepolia";
    const faucetMessage = `If you ever need funds, you can request them from the faucet.`;
    const cantUseFaucetMessage = `If you need funds, you can provide your wallet details and request funds from the user.`;
    
    console.log("Creating React agent...");
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. ${canUseFaucet ? faucetMessage : cantUseFaucetMessage}.
        Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        explain that they can add more capabilities by adding more action providers to your AgentKit configuration.
        ALWAYS include this link when mentioning missing capabilities, which will help them discover available action providers: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#action-providers
        If users require more information regarding CDP or AgentKit, recommend they visit docs.cdp.coinbase.com for more information.
        Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        `,
    });
    console.log("React agent created successfully");

    // Cache the agent
    agentCache.set(keyHash, agent);

    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      apiKeysProvided: {
        openaiKey: !!openaiKey,
        cdpApiFile: !!cdpApiFile,
        networkId: networkId
      }
    });
    throw new Error(`Failed to initialize agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}
