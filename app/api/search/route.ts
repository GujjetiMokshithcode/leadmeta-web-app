import { NextRequest, NextResponse } from 'next/server';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

interface SearchResult {
  email: string;
  source: string;
}

interface SearchResponse {
  success: boolean;
  emails: SearchResult[];
  totalFound: number;
  query: string;
  error?: string;
}

// Email extraction regex
const extractEmails = (text: string): string[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches)]; // Deduplicate
};

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          emails: [],
          totalFound: 0,
          query: '',
          error: 'Query is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (!SERPER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          emails: [],
          totalFound: 0,
          query,
          error: 'SERPER_API_KEY environment variable is not set',
        },
        { status: 500 }
      );
    }

    // Call Serper API
    const serperResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 20, // Get top 20 results
      }),
    });

    if (!serperResponse.ok) {
      const errorData = await serperResponse.text();
      console.error('Serper API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          emails: [],
          totalFound: 0,
          query,
          error: `Serper API error: ${serperResponse.status}`,
        },
        { status: serperResponse.status }
      );
    }

    const data = await serperResponse.json();

    // Extract emails from all text content
    const allEmails = new Set<string>();
    const emailResults: SearchResult[] = [];

    // Check organic results
    if (data.organic && Array.isArray(data.organic)) {
      for (const result of data.organic) {
        const emails = extractEmails(
          `${result.title || ''} ${result.snippet || ''}`
        );
        emails.forEach((email) => {
          if (!allEmails.has(email)) {
            allEmails.add(email);
            emailResults.push({
              email,
              source: result.link || 'unknown',
            });
          }
        });
      }
    }

    // Check knowledge graph
    if (data.knowledgeGraph) {
      const kg = data.knowledgeGraph;
      const emails = extractEmails(`${kg.title || ''} ${kg.description || ''}`);
      emails.forEach((email) => {
        if (!allEmails.has(email)) {
          allEmails.add(email);
          emailResults.push({
            email,
            source: 'knowledge-graph',
          });
        }
      });
    }

    // Check answer box
    if (data.answerBox) {
      const ab = data.answerBox;
      const emails = extractEmails(ab.answer || '');
      emails.forEach((email) => {
        if (!allEmails.has(email)) {
          allEmails.add(email);
          emailResults.push({
            email,
            source: 'answer-box',
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      emails: emailResults,
      totalFound: emailResults.length,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        emails: [],
        totalFound: 0,
        query: '',
        error: 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}
