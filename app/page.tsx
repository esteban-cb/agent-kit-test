"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "./hooks/useAgent";
import ReactMarkdown from "react-markdown";
import { ApiKeys } from "./types/api";

// Component for API Key Configuration
function ApiKeyConfig({ onKeysConfigured }: { onKeysConfigured: (keys: ApiKeys) => void }) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [cdpApiFile, setCdpApiFile] = useState<File | null>(null);
  const [networkId, setNetworkId] = useState("base-sepolia");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      setCdpApiFile(file);
      setError("");
    } else {
      setCdpApiFile(null);
      setError("Please select a valid JSON file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!openaiKey.trim() || !cdpApiFile) {
      setError("OpenAI API key and CDP API key JSON file are required");
      return;
    }

    setIsValidating(true);
    
    try {
      // Read the CDP API key file
      const fileContent = await cdpApiFile.text();
      const cdpKeyData = JSON.parse(fileContent);

      // Validate file structure
      if (!cdpKeyData.privateKey || (!cdpKeyData.name && !cdpKeyData.id)) {
        setError("Invalid CDP API key file format");
        setIsValidating(false);
        return;
      }

      // Test the API keys by making a call to our validation endpoint
      const response = await fetch("/api/validate-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openaiKey: openaiKey.trim(),
          cdpApiFile: fileContent,
          networkId: networkId
        }),
      });

      const result = await response.json();
      
      if (result.valid) {
        onKeysConfigured({
          openaiKey: openaiKey.trim(),
          cdpApiFile: fileContent,
          networkId: networkId
        });
      } else {
        setError(result.error || "Invalid API keys");
      }
    } catch {
      setError("Failed to validate API keys. Please check your keys and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-black dark:text-white w-full h-full">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Configure API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Please enter your OpenAI API key and upload your CDP API key JSON file
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 rounded border dark:bg-gray-700 dark:border-gray-600"
              disabled={isValidating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              CDP API Key JSON File
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="w-full p-3 rounded border dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isValidating}
            />
            {cdpApiFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {cdpApiFile.name} selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Network
            </label>
            <select
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
              className="w-full p-3 rounded border dark:bg-gray-700 dark:border-gray-600"
              disabled={isValidating}
            >
              <option value="base-sepolia">Base Sepolia (Testnet)</option>
              <option value="base-mainnet">Base Mainnet</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating}
            className={`w-full py-3 rounded font-semibold transition-all ${
              isValidating
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-[#0052FF] hover:bg-[#003ECF] text-white shadow-md"
            }`}
          >
            {isValidating ? "Validating..." : "Start AgentKit"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h3 className="font-semibold mb-2">Where to get your API keys:</h3>
          <ul className="text-sm space-y-1">
            <li>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
            <li>• CDP Keys: <a href="https://portal.cdp.coinbase.com/access/api" target="_blank" className="text-blue-600 hover:underline">portal.cdp.coinbase.com/access/api</a> (download JSON file)</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 dark:text-green-400 mt-0.5">🔒</div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">Security & Privacy</h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Your API keys are <strong>never stored permanently</strong></li>
                <li>• Keys only exist in memory during your session</li>
                <li>• Refreshing the page will clear all keys</li>
                <li>• No data is saved to your browser's storage</li>
                <li>• Temporary server files are automatically cleaned up</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Home page for the AgentKit Quickstart
 *
 * @returns {React.ReactNode} The home page
 */
export default function Home() {
  const [input, setInput] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const { messages, sendMessage, isThinking, setApiKeys: setAgentApiKeys } = useAgent();

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onKeysConfigured = (keys: ApiKeys) => {
    setAgentApiKeys(keys);
    setIsConfigured(true);
  };

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const resetConfiguration = () => {
    setIsConfigured(false);
  };

  if (!isConfigured) {
    return <ApiKeyConfig onKeysConfigured={onKeysConfigured} />;
  }

  return (
    <div className="flex flex-col flex-grow items-center justify-center text-black dark:text-white w-full h-full">
      <div className="w-full max-w-2xl h-[70vh] bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col">
        {/* Header with config reset */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">AgentKit Chat</h2>
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <span>🔒</span>
              <span>Session-only</span>
            </div>
          </div>
          <button
            onClick={resetConfiguration}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Change API Keys
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto space-y-3 p-2">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">Start chatting with AgentKit...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-2xl shadow ${
                  msg.sender === "user"
                    ? "bg-[#0052FF] text-white self-end"
                    : "bg-gray-100 dark:bg-gray-700 self-start"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: props => (
                      <a
                        {...props}
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))
          )}

          {/* Thinking Indicator */}
          {isThinking && <div className="text-right mr-2 text-gray-500 italic">🤖 Thinking...</div>}

          {/* Invisible div to track the bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            placeholder={"Type a message..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSendMessage()}
            disabled={isThinking}
          />
          <button
            onClick={onSendMessage}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              isThinking
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-[#0052FF] hover:bg-[#003ECF] text-white shadow-md"
            }`}
            disabled={isThinking}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
