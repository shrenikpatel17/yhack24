import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { input } = await req.json();
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });
    return NextResponse.json(embeddingResponse.data[0].embedding);
  } catch (error) {
    console.error("OpenAI API error: ", error);
    return NextResponse.json({ error: 'Failed to get embedding' }, { status: 500 });
  }
}
