import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { prompt } = await req.json();
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json(gptResponse.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API error: ", error);
    return NextResponse.json({ error: 'Failed to get GPT response' }, { status: 500 });
  }
}
