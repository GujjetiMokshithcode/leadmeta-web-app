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

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a lead generation expert. Your task is to generate 5 high-yield Google Search "Dorks" to find email addresses based on the user's request.
          
          RULES:
          1. Detect the platform: If the user asks for Instagram, use site:instagram.com. If LinkedIn, use site:linkedin.com/in/. If no platform, use general search or common sites.
          2. Focus on Emails: Always include common email providers like "@gmail.com" OR "@yahoo.com" OR "@outlook.com".
          3. Format: Output ONLY the queries, one per line. 
          4. NO numbers, NO labels, NO introductory text.
          
          Example for "Instagram photographers":
          site:instagram.com "photographer" "@gmail.com"
          site:instagram.com "photography" "@outlook.com"
          "photographer" "instagram.com" "@gmail.com"
          ...`
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    
    // Robust cleaning: remove numbers, empty lines, and labels
    const queries = content
      .split(/[\r\n]+/)
      .map(q => q.trim())
      .map(q => q.replace(/^\d+[\s.)]*/, '')) // Remove leading numbers like "1.", "1)", "1 "
      .filter(q => q.length > 5 && q.includes('"')); // Filter out junk lines or numbers on their own line

    console.log("[Diagnostic] AI Generated Queries:", queries);

    return NextResponse.json({ success: true, queries });
  } catch (error: any) {
    console.error("Groq Error Detail:", error);
    return NextResponse.json(
      {
        error: error?.message || "AI failed",
        details: error?.status === 401 ? "Check API key" : undefined,
      },
      { status: error?.status || 500 },
    );
  }
}
