import {
  AgentKit,
  cdpApiActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  SmartWalletProvider,
  walletActionProvider,
  WalletProvider,
  wethActionProvider,
} from "@coinbase/agentkit";
import * as fs from "fs";
import { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ApiKeys } from "@/app/types/api";

/**
 * AgentKit Integration Route
 *
 * This file is your gateway to integrating AgentKit with your product.
 * It defines the core capabilities of your agent through WalletProvider
 * and ActionProvider configuration.
 *
 * Key Components:
 * 1. WalletProvider Setup:
 *    - Configures the blockchain wallet integration
 *    - Learn more: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#evm-wallet-providers
 *
 * 2. ActionProviders Setup:
 *    - Defines the specific actions your agent can perform
 *    - Choose from built-in providers or create custom ones:
 *      - Built-in: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#action-providers
 *      - Custom: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#creating-an-action-provider
 *
 * # Next Steps:
 * - Explore the AgentKit README: https://github.com/coinbase/agentkit
 * - Experiment with different LLM configurations
 * - Fine-tune agent parameters for your use case
 *
 * ## Want to contribute?
 * Join us in shaping AgentKit! Check out the contribution guide:
 * - https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING.md
 * - https://discord.gg/CDP
 */

// Configure a file to persist the agent's Smart Wallet + Private Key data
const WALLET_DATA_FILE = "wallet_data.txt";
const CDP_API_KEY_FILE = "coinbase_cloud_api_key.json";

type WalletData = {
  privateKey: Hex;
  smartWalletAddress: Address;
};

/**
 * Prepares the AgentKit and WalletProvider.
 *
 * @function prepareAgentkitAndWalletProvider
 * @param {ApiKeys} apiKeys - The API keys object containing cdpApiKeyName, cdpPrivateKey and networkId
 * @returns {Promise<{ agentkit: AgentKit, walletProvider: WalletProvider }>} The initialized AI agent.
 *
 * @description Handles agent setup with provided API keys
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function prepareAgentkitAndWalletProvider(apiKeys: ApiKeys): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
}> {
  if (!apiKeys || !apiKeys.cdpApiKeyName || !apiKeys.cdpPrivateKey) {
    throw new Error(
      "CDP API key name and private key are required to connect to the Coinbase Developer Platform.",
    );
  }

  const { cdpApiKeyName, cdpPrivateKey, networkId } = apiKeys;

  // Create CDP API key file from manual input
  try {
    console.log("Creating CDP API key file from provided credentials...");
    
    const cdpKeyData = {
      name: cdpApiKeyName,
      privateKey: cdpPrivateKey
    };
    
    console.log("CDP Key data structure:", {
      hasName: !!cdpKeyData.name,
      hasPrivateKey: !!cdpKeyData.privateKey,
      networkId: networkId
    });

    fs.writeFileSync(CDP_API_KEY_FILE, JSON.stringify(cdpKeyData, null, 2));
    console.log("CDP API key file created successfully");
  } catch (error) {
    console.error("Error creating CDP API key file:", error);
    throw new Error("Failed to create CDP API key file");
  }

  let walletData: WalletData | null = null;
  let privateKey: Hex | null = null;

  // Read existing wallet data if available
  if (fs.existsSync(WALLET_DATA_FILE)) {
    try {
      walletData = JSON.parse(fs.readFileSync(WALLET_DATA_FILE, "utf8")) as WalletData;
      privateKey = walletData.privateKey;
      console.log("Loaded existing wallet data");
    } catch {
      // Error reading wallet data - we'll generate a new one
      console.log("Could not read existing wallet data, will generate new");
    }
  }

  if (!privateKey) {
    if (walletData?.smartWalletAddress) {
      throw new Error(
        `I found your smart wallet but can't access your private key. Please either provide the private key in your .env, or delete ${WALLET_DATA_FILE} to create a new wallet.`,
      );
    }
    privateKey = (process.env.PRIVATE_KEY || generatePrivateKey()) as Hex;
    console.log("Generated new private key");
  }

  try {
    console.log("Creating signer from private key...");
    const signer = privateKeyToAccount(privateKey);
    console.log("Signer created successfully");

    // Initialize WalletProvider: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management
    console.log("Configuring SmartWalletProvider...");
    const walletProvider = await SmartWalletProvider.configureWithWallet({
      networkId: networkId || "base-sepolia",
      signer,
      smartWalletAddress: walletData?.smartWalletAddress,
      paymasterUrl: undefined, // Sponsor transactions: https://docs.cdp.coinbase.com/paymaster/docs/welcome
    });
    console.log("SmartWalletProvider configured successfully");

    // Initialize AgentKit: https://docs.cdp.coinbase.com/agentkit/docs/agent-actions
    console.log("Initializing AgentKit with action providers...");
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider(), // Now uses the temporary file
      ],
    });
    console.log("AgentKit initialized successfully");

    // Save wallet data
    const smartWalletAddress = walletProvider.getAddress();
    fs.writeFileSync(
      WALLET_DATA_FILE,
      JSON.stringify({
        privateKey,
        smartWalletAddress,
      } as WalletData),
    );
    console.log("Wallet data saved successfully");

    return { agentkit, walletProvider };
  } catch (error) {
    console.error("Error initializing agent:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      networkId: networkId
    });
    throw new Error(`Failed to initialize AgentKit: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up the temporary CDP API key file
    try {
      if (fs.existsSync(CDP_API_KEY_FILE)) {
        fs.unlinkSync(CDP_API_KEY_FILE);
        console.log("Cleaned up temporary CDP API key file");
      }
    } catch {
      // Ignore cleanup errors
      console.log("Could not clean up temporary CDP API key file");
    }
  }
}
