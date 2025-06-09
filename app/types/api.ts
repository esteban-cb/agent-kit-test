export type AgentRequest = { userMessage: string };

export type AgentResponse = { response?: string; error?: string };

export interface ApiKeys {
  openaiKey: string;
  cdpApiKeyName: string;
  cdpPrivateKey: string;
  networkId: string;
}
