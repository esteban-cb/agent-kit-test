import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(req: Request) {
  try {
    const { openaiKey, cdpApiKeyName, cdpPrivateKey } = await req.json();

    if (!openaiKey || !cdpApiKeyName || !cdpPrivateKey) {
      return NextResponse.json({
        valid: false,
        error: "OpenAI API key, CDP API key name, and CDP private key are required"
      });
    }

    // Test OpenAI API key
    try {
      const testLLM = new ChatOpenAI({ 
        model: "gpt-4o-mini",
        apiKey: openaiKey,
      });
      
      // Make a minimal test call
      await testLLM.invoke("Hello");
    } catch {
      return NextResponse.json({
        valid: false,
        error: "Invalid OpenAI API key"
      });
    }

    // Validate CDP credentials (basic format check)
    if (!cdpPrivateKey.startsWith("0x") || cdpPrivateKey.length < 64) {
      return NextResponse.json({
        valid: false,
        error: "Invalid CDP private key format. Should start with '0x' and be at least 64 characters long."
      });
    }

    if (cdpApiKeyName.trim().length < 3) {
      return NextResponse.json({
        valid: false,
        error: "CDP API key name should be at least 3 characters long."
      });
    }

    return NextResponse.json({
      valid: true,
      message: "API keys validated successfully"
    });

  } catch {
    return NextResponse.json({
      valid: false,
      error: "Failed to validate API keys"
    });
  }
} 