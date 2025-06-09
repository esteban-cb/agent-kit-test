# AI Agent with Onchain Capabilities

A Next.js application that provides an AI-powered chat interface with blockchain interaction capabilities. Built using Coinbase's AgentKit, this app enables users to chat with an AI agent that can perform onchain operations like sending tokens, getting wallet balances, and interacting with smart contracts.

## Features

- **AI-Powered Chat Interface**: Natural language conversations with an intelligent agent
- **Onchain Capabilities**: Perform blockchain operations through chat commands
- **Multi-Network Support**: Works with Base Mainnet and Base Sepolia testnet
- **Secure API Key Management**: Safe handling of OpenAI and Coinbase Developer Platform credentials
- **Real-time Streaming**: Live responses from the AI agent
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## What Can the Agent Do?

The AI agent can help you with various blockchain operations:

- **Wallet Management**: Check balances, view transaction history
- **Token Operations**: Send ETH, USDC, and other tokens
- **Smart Contract Interactions**: Deploy and interact with contracts
- **DeFi Operations**: Swap tokens, provide liquidity
- **NFT Operations**: Mint, transfer, and manage NFTs
- **Network Information**: Get gas prices, block information

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **OpenAI API Key** - Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. **Coinbase Developer Platform (CDP) API Key** - Get one at [portal.cdp.coinbase.com/access/api](https://portal.cdp.coinbase.com/access/api)

## Getting Started

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Get Your API Keys

#### OpenAI API Key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### CDP API Key
1. Visit [portal.cdp.coinbase.com/access/api](https://portal.cdp.coinbase.com/access/api)
2. Create a new API key
3. **Download the JSON file** (this contains your private key and API credentials)
4. Keep this file secure - you'll upload it in the app

### 3. Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure Your Keys

1. The app will prompt you to enter your API keys on first load
2. Enter your OpenAI API key
3. Upload your CDP API key JSON file
4. Select your preferred network (Base Sepolia for testing, Base Mainnet for production)
5. Click "Start AgentKit"

The app will validate your keys and set up the agent.

## Usage Examples

Once configured, you can chat with the agent using natural language:

```
"What's my wallet balance?"
"Send 0.01 ETH to 0x742d35Cc6C7Aa1234567890..."
"Get the current gas price"
"Deploy an ERC20 token called MyToken with symbol MTK"
"Swap 10 USDC for ETH"
```

## Security & Privacy

Your security is our priority. Here's how your sensitive data is handled:

### API Key Security
- 🔒 **Never stored permanently** - API keys only exist in memory during your session
- 🔄 **Session-only** - Keys are automatically cleared when you refresh or close the page
- 🚫 **No browser storage** - No localStorage, sessionStorage, or cookies used for keys
- 🧹 **Automatic cleanup** - Temporary server files are immediately deleted after use

### Blockchain Security
- 🔑 **Wallet management** - Private keys are managed by Coinbase's secure CDP infrastructure
- ✅ **User confirmation** - All blockchain operations require explicit chat commands
- 🧪 **Testnet first** - Always test on Base Sepolia before using mainnet
- 📝 **Transaction transparency** - All operations are clearly logged and explained

### Best Practices
- Use **Base Sepolia testnet** for development and testing
- Never share your API keys with others
- Keep your CDP API key JSON file secure
- Monitor your wallet activity regularly

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI/ML**: OpenAI GPT models via @ai-sdk/openai
- **Blockchain**: AgentKit (@coinbase/agentkit), Viem, Wagmi
- **State Management**: TanStack React Query
- **API**: Next.js API routes with streaming support

## Project Structure

```
agent-kit-test/
├── app/
│   ├── api/
│   │   ├── agent/           # AI agent endpoints
│   │   └── validate-keys/   # API key validation
│   ├── hooks/
│   │   └── useAgent.ts      # React hook for agent interactions
│   ├── types/
│   │   └── api.ts           # TypeScript type definitions
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # App layout
│   └── page.tsx             # Main chat interface
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── wallet_data.txt          # Generated wallet information
```

## Network Configuration

- **Base Sepolia**: Testnet for development and testing
- **Base Mainnet**: Production network with real assets

⚠️ **Important**: Start with Base Sepolia testnet for testing before using mainnet.

## Troubleshooting

### Common Issues

1. **"Invalid API keys" error**
   - Verify your OpenAI API key is correct
   - Ensure CDP JSON file is properly formatted
   - Check that your CDP API key has sufficient permissions

2. **"Failed to validate API keys"**
   - Check your internet connection
   - Verify API keys haven't expired
   - Try regenerating your keys

3. **Wallet operations fail**
   - Ensure you're on the correct network
   - Check wallet has sufficient balance for gas fees
   - Verify recipient addresses are valid

### Getting Help

- Check the [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- Review [CDP Documentation](https://docs.cdp.coinbase.com/)
- Join the [CDP Discord](https://discord.gg/CDP)

## Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Configuring Your Agent

You can [modify your configuration](https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#usage) of the agent. By default, your agentkit configuration occurs in the `/api/agent/prepare-agentkit.ts` file, and agent instantiation occurs in the `/api/agent/create-agent.ts` file.

### 1. Select Your LLM  
Modify the OpenAI model instantiation to use the model of your choice.

### 2. Select Your Wallet Provider  
AgentKit requires a **Wallet Provider** to interact with blockchain networks.

### 3. Select Your Action Providers  
Action Providers define what your agent can do. You can use built-in providers or create your own.

---

## Next Steps

- Explore the AgentKit README: [AgentKit Documentation](https://github.com/coinbase/agentkit)
- Learn more about available Wallet Providers & Action Providers.
- Experiment with custom Action Providers for your specific use case.

---

## Learn More

- [Learn more about CDP](https://docs.cdp.coinbase.com/)
- [Learn more about AgentKit](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [Learn more about Next.js](https://nextjs.org/docs)
- [Learn more about Tailwind CSS](https://tailwindcss.com/docs)

---

## Contributing

Interested in contributing to AgentKit? Follow the contribution guide:

- [Contribution Guide](https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING.md)
- Join the discussion on [Discord](https://discord.gg/CDP)
