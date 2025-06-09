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

    // Validate CDP credentials (accept Base64, PEM, or hex formats)
    const isPEMFormat = cdpPrivateKey.includes("-----BEGIN") && cdpPrivateKey.includes("-----END");
    const isBase64Format = /^[A-Za-z0-9+/=]+$/.test(cdpPrivateKey) && cdpPrivateKey.length > 20;
    const isHexFormat = cdpPrivateKey.startsWith("0x") && cdpPrivateKey.length >= 64;
    
    if (!isPEMFormat && !isBase64Format && !isHexFormat) {
      return NextResponse.json({
        valid: false,
        error: "Invalid CDP private key format. Should be in PEM format (-----BEGIN EC PRIVATE KEY-----), Base64 format, or hex format (0x...)."
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