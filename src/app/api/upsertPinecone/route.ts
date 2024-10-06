import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

const indexName = 'quickstart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, values, metadata } = body;

    if (!id || !values || !metadata) {
      return NextResponse.json({ error: 'Missing required fields (id, values, metadata)' }, { status: 400 });
    }

    const index = pc.index(indexName);
    
    await index.upsert([
      {
        id,
        values,
        metadata,
      },
    ]);

    return NextResponse.json({ success: true, message: 'Data upserted successfully' });
  } catch (error) {
    console.error('Error upserting into Pinecone:', error);
    return NextResponse.json({ error: 'Error upserting into Pinecone', details: error }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 });
}
