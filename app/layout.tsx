import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

/**
 * Metadata for the page
 */
export const metadata: Metadata = {
  title: "AgentKit Chat - AI-Powered Blockchain Assistant",
  description: "Chat with an AI agent that can perform blockchain operations on Base. Upload your API keys and start interacting with decentralized finance through natural language.",
  keywords: ["AgentKit", "Coinbase", "CDP", "AI", "blockchain", "Base", "DeFi", "chat", "assistant"],
  openGraph: {
    title: "AgentKit Chat - AI-Powered Blockchain Assistant",
    description: "Chat with an AI agent that can perform blockchain operations on Base. Upload your API keys and start interacting with decentralized finance through natural language.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentKit Chat - AI-Powered Blockchain Assistant",
    description: "Chat with an AI agent that can perform blockchain operations on Base. Upload your API keys and start interacting with decentralized finance through natural language.",
  },
};

/**
 * Root layout for the page
 *
 * @param {object} props - The props for the root layout
 * @param {React.ReactNode} props.children - The children for the root layout
 * @returns {React.ReactNode} The root layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 dark flex flex-col min-h-screen">
        {/* Header (Fixed Height) */}
        <header className="py-6 flex items-center justify-between relative">
          <Image
            src="https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg"
            alt="Coinbase"
            width={120}
            height={32}
            className="h-8 ml-4"
          />

          <span className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            AgentKit
          </span>
        </header>

        {/* Main Content (Dynamic, Grows but Doesn't Force Scroll) */}
        <main className="flex-grow flex items-center justify-center px-4">{children}</main>

        {/* Footer (Fixed Height) */}
        <footer className="py-4 text-center text-gray-500 dark:text-gray-400 flex-none">
          <Image
            src="https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg"
            alt="Coinbase"
            width={96}
            height={24}
            className="h-6 mx-auto mb-2"
          />
          <div className="mt-2">
            <a
              href="https://github.com/coinbase/agentkit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              GitHub
            </a>{" "}
            |{" "}
            <a
              href="https://docs.cdp.coinbase.com/agentkit/docs/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              Documentation
            </a>{" "}
            |{" "}
            <a
              href="https://discord.gg/CDP"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              Discord
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Powered by{" "}
            <a
              href="https://docs.cdp.coinbase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              CDP
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2">© {new Date().getFullYear()} Coinbase, Inc.</p>
        </footer>
      </body>
    </html>
  );
}
