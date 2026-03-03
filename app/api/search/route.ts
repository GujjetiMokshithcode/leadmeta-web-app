import { NextRequest, NextResponse } from 'next/server';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

interface SearchResult {
  email: string;
  source: string;
  extractedFrom?: 'title' | 'snippet' | 'url';
}

interface SearchResponse {
  success: boolean;
  emails: SearchResult[];
  totalFound: number;
  organicCount: number;
  query: string;
  error?: string;
}

// Email extraction regex
const extractEmails = (text: string): string[] => {
  const normalizedText = text.toLowerCase();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = normalizedText.match(emailRegex) || [];
  return [...new Set(matches)]; // Deduplicate
};

// Extract emails with source tracking
const extractEmailsWithSource = (
  title: string = '',
  snippet: string = '',
  url: string = ''
): Array<{ email: string; source: 'title' | 'snippet' | 'url' }> => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const results: Array<{ email: string; source: 'title' | 'snippet' | 'url' }> = [];

  // Extract from title
  const titleMatches = title.toLowerCase().match(emailRegex) || [];
  titleMatches.forEach((email) => results.push({ email, source: 'title' }));

  // Extract from snippet
  const snippetMatches = snippet.toLowerCase().match(emailRegex) || [];
  snippetMatches.forEach((email) => results.push({ email, source: 'snippet' }));

  // Extract from URL
  const urlMatches = url.toLowerCase().match(emailRegex) || [];
  urlMatches.forEach((email) => results.push({ email, source: 'url' }));

  return results;
};

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    let { query, page = 1, num = 10 } = await request.json();

    // Ensure num is within a safe range for Serper (1-100, but 20 is safer for complex queries)
    num = Math.min(Math.max(1, num), 20);
    page = Math.max(1, page);

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          emails: [],
          totalFound: 0,
          organicCount: 0,
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
          organicCount: 0,
          query,
          error: 'SERPER_API_KEY environment variable is not set',
        },
        { status: 500 }
      );
    }

    // Call Serper API with pagination
    const serperResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: num,
        page: page,
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
          organicCount: 0,
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
    const organicCount = data.organic?.length || 0;

    // Check organic results
    if (data.organic && Array.isArray(data.organic)) {
      for (const result of data.organic) {
        const emailsWithSource = extractEmailsWithSource(
          result.title || '',
          result.snippet || '',
          result.link || ''
        );
        emailsWithSource.forEach(({ email, source: sourceType }) => {
          if (!allEmails.has(email)) {
            allEmails.add(email);
            emailResults.push({
              email,
              source: result.link || 'unknown',
              extractedFrom: sourceType,
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
      organicCount,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        emails: [],
        totalFound: 0,
        organicCount: 0,
        query: '',
        error: 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}
