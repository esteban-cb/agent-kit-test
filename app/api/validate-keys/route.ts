import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(req: Request) {
  try {
    const { openaiKey, cdpApiFile } = await req.json();

    if (!openaiKey || !cdpApiFile) {
      return NextResponse.json({
        valid: false,
        error: "OpenAI API key and CDP API file are required"
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

    // Validate CDP API file structure
    try {
      const cdpKeyData = JSON.parse(cdpApiFile);
      
      if (!cdpKeyData.privateKey || (!cdpKeyData.name && !cdpKeyData.id)) {
        return NextResponse.json({
          valid: false,
          error: "Invalid CDP API key file format. File must contain 'privateKey' and either 'name' or 'id' field."
        });
      }
    } catch {
      return NextResponse.json({
        valid: false,
        error: "Invalid JSON format in CDP API key file"
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