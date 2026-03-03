import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  console.log("[Diagnostic] /api/generate-queries route HIT");
  
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // TESTING: Hardcoded key as requested by user
    const apiKey = "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";

    console.log("[Diagnostic] Using provided key for testing, length:", apiKey.length);

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a lead generation expert. Convert the user prompt into 5 Google Search queries for finding emails on LinkedIn. Output ONLY the queries, one per line. No numbers.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    const queries = content
      .split(/[\r\n]+/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    return NextResponse.json({ success: true, queries });
  } catch (error: any) {
    console.error("Groq Error Detail:", error);
    return NextResponse.json(
      {
        error: error?.message || "AI failed",
        details:
          error?.status === 401
            ? "Even with the hardcoded key, Groq returned 401. This key may be invalid or restricted."
            : undefined,
      },
      { status: error?.status || 500 },
    );
  }
}
