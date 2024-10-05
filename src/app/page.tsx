"use client"

import { useState } from 'react';
import OpenAI from 'openai';

const openaiApiKey = "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"

const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true,
});

async function getEmbedding(input: string) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
    encoding_format: 'float',
  });

  return embeddingResponse.data[0].embedding;
}

async function getGPTResponse(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchAndSave = async () => {
    if (!question.trim()) return; // Prevent empty submissions

    setIsLoading(true);
    setResults([]); // Clear previous results
    setAnswer(null); // Clear previous answer

    try {
      const vector = await getEmbedding(question);

      const response = await fetch('/api/queryPinecone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vector }),
      });

      const queryResponse = await response.json();
      console.log("Query response: ", queryResponse);

      if (queryResponse && queryResponse.length > 0) {
        setResults(queryResponse);
      } else {
        const gptAnswer = await getGPTResponse(question);

        await fetch('/api/upsertPinecone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: `id-${Date.now()}`,
            values: vector,
            metadata: { question, answer: gptAnswer ?? '' },
          }),
        });

        setAnswer(gptAnswer);
      }
    } catch (error) {
      console.error('Error during search or save:', error);
      setAnswer("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SustainLLM</h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="flex-grow p-2 border rounded-l"
          disabled={isLoading}
        />
        <button 
          onClick={handleSearchAndSave}
          className={`text-white p-2 rounded-r ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </div>

      <div>
        {isLoading ? (
          <p className="text-center">Processing your query...</p>
        ) : results.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-2">Similar Results:</h2>
            {results.map((result, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded">
                {result.metadata && (
                  <>
                    <p><strong>Question:</strong> {result.metadata.question}</p>
                    <p><strong>Answer:</strong> {result.metadata.answer}</p>
                    <p><strong>Similarity:</strong> {result.score?.toFixed(4)}</p>
                  </>
                )}
              </div>
            ))}
          </>
        ) : answer ? (
          <>
            <h2 className="text-xl font-semibold mb-2">GPT-3.5 Response:</h2>
            <p className="p-4 border rounded">{answer}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}