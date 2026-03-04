import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { queries, instruction } = await request.json();

    if (!queries || !Array.isArray(queries) || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    // Fallback: simple keyword replacement for all queries
    if (!apiKey) {
      const modifiedQueries = queries.map(q => {
        let modified = q;
        const lowerInstruction = instruction.toLowerCase();
        
        if (lowerInstruction.includes('gmail') || lowerInstruction.includes('only gmail')) {
          if (!modified.includes('@gmail.com')) {
            modified = modified + ' @gmail.com';
          }
        }
        
        if (lowerInstruction.includes('yahoo')) {
          if (!modified.includes('@yahoo.com')) {
            modified = modified + ' @yahoo.com';
          }
        }
        
        if (lowerInstruction.includes('outlook') || lowerInstruction.includes('hotmail')) {
          if (!modified.includes('@outlook.com')) {
            modified = modified + ' @outlook.com';
          }
        }

        return modified;
      });

      return NextResponse.json({ queries: modifiedQueries });
    }

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a search query optimizer. Modify ALL of the following Google search queries based on the user's instruction.

Original queries:
${queries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

User's instruction: "${instruction}"

Return ONLY the modified queries as a numbered list (1., 2., 3., etc.), one per line, without any quotes, explanations, or formatting. Each query should be optimized for finding email addresses.`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000,
              }
            }),
          }
        );

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const text = data.candidates[0].content.parts[0].text.trim();
          // Parse numbered list
          const modifiedQueries = text.split('\n')
            .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
            .filter((line: string) => line.length > 0);
          
          if (modifiedQueries.length === queries.length) {
            return NextResponse.json({ queries: modifiedQueries });
          }
        }
      } catch (error) {
        console.error('Gemini error:', error);
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a search query optimizer. Modify all search queries based on user instructions. Return as numbered list, one per line.'
            },
            {
              role: 'user',
              content: `Original queries:\n${queries.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nInstruction: "${instruction}"\n\nReturn only the modified queries as a numbered list (1., 2., etc.), one per line, optimized for finding email addresses.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        const text = data.choices[0].message.content.trim();
        const modifiedQueries = text.split('\n')
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 0);
        
        if (modifiedQueries.length === queries.length) {
          return NextResponse.json({ queries: modifiedQueries });
        }
      }
    }

    // Ultimate fallback: return original queries
    return NextResponse.json({ queries });

  } catch (error) {
    console.error('Edit queries error:', error);
    return NextResponse.json(
      { error: 'Failed to edit queries' },
      { status: 500 }
    );
  }
}
