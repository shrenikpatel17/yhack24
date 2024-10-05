import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';

const pc = new Pinecone({
  apiKey: 'ffb47360-de2b-428b-aec3-615eabd8b22f',
});

const indexName = 'quickstart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vector } = body;

    const index = pc.index(indexName);
    
    const queryResponse = await index.query({
      vector,
      topK: 3,
      includeValues: true,
      includeMetadata: true,
    });

    // console.log(queryResponse)

    const filteredResults = queryResponse.matches.filter((match) => 
    typeof match.score === 'number' && match.score >= 0.925
    );
  
    console.log(filteredResults)

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json({ error: 'Error querying Pinecone', details: error }, { status: 500 });
  }
}
