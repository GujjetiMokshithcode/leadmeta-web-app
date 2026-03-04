import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalQuery, instruction } = await request.json();

    if (!originalQuery || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback: simple keyword replacement
      let modifiedQuery = originalQuery;
      
      const lowerInstruction = instruction.toLowerCase();
      
      // Handle common patterns
      if (lowerInstruction.includes('gmail') || lowerInstruction.includes('only gmail')) {
        if (!modifiedQuery.includes('@gmail.com')) {
          modifiedQuery = modifiedQuery + ' @gmail.com';
        }
      }
      
      if (lowerInstruction.includes('yahoo')) {
        if (!modifiedQuery.includes('@yahoo.com')) {
          modifiedQuery = modifiedQuery + ' @yahoo.com';
        }
      }
      
      if (lowerInstruction.includes('outlook') || lowerInstruction.includes('hotmail')) {
        if (!modifiedQuery.includes('@outlook.com')) {
          modifiedQuery = modifiedQuery + ' @outlook.com';
        }
      }

      return NextResponse.json({ query: modifiedQuery });
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
                  text: `You are a search query optimizer. Modify the following Google search query based on the user's instruction.

Original query: "${originalQuery}"
User's instruction: "${instruction}"

Return ONLY the modified search query as plain text, without any quotes, explanations, or formatting. The query should be optimized for finding email addresses.`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 200,
              }
            }),
          }
        );

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const query = data.candidates[0].content.parts[0].text.trim();
          return NextResponse.json({ query });
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
              content: 'You are a search query optimizer. Modify search queries based on user instructions. Return ONLY the modified query, no explanations.'
            },
            {
              role: 'user',
              content: `Original query: "${originalQuery}"
Instruction: "${instruction}"

Return only the modified search query optimized for finding email addresses.`
            }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        const query = data.choices[0].message.content.trim();
        return NextResponse.json({ query });
      }
    }

    // Ultimate fallback
    return NextResponse.json({ query: originalQuery });

  } catch (error) {
    console.error('Edit query error:', error);
    return NextResponse.json(
      { error: 'Failed to edit query' },
      { status: 500 }
    );
  }
}
