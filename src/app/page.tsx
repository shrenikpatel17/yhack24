"use client"

import { useState } from 'react';
import OpenAI from 'openai';
import React from 'react';
import { Globe } from 'lucide-react';
import sustainllmicon from '../app/image/sustainllmicon.png'
import Image from 'next/image';

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
  const [hasSearched, setHasSearched] = useState(false);
  const [isGettingMoreInfo, setIsGettingMoreInfo] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleSearchAndSave = async () => {
    if (!question.trim()) return; // Prevent empty submissions

    setIsLoading(true);
    setResults([]); // Clear previous results
    setAnswer(null); // Clear previous answer
    setHasSearched(false);

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

      setHasSearched(true);

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

  const handleNeedMore = async () => {
    setAnswer("");
    setIsGettingMoreInfo(true);
    try {
      const gptAnswer = await getGPTResponse(question);
      setAnswer((prevAnswer) => {
        const newAnswer = prevAnswer ? `${prevAnswer}\n\nAdditional Information:\n${gptAnswer}` : gptAnswer;
        return newAnswer;
      });
    } catch (error) {
      console.error("Error getting more info:", error);
    } finally {
      setIsGettingMoreInfo(false);
    }
  };

  const handleApprove = async () => {
    setIsApproved(false);
    try {
      const vector = await getEmbedding(question);

      await fetch('/api/upsertPinecone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `id-${Date.now()}`,
          values: vector,
          metadata: { question, answer: answer ?? '' },
        }),
      });
    } catch (error) {
      console.error("Error with approval:", error);
    } finally {
      setIsApproved(true);
    }
  };

  const getCharacterCount = () => {
    var charLength = 0;
    if (answer && results) {
      charLength = results.reduce((total, result) => total + (result.metadata?.answer?.length || 0), 0)
    }
    if (results && !answer) {
      charLength = results.reduce((total, result) => total + (result.metadata?.answer?.length || 0), 0)
    }
    if (answer && !results){
      charLength = 0;
    }

    return charLength;
  };
  
  console.log("Count: ", getCharacterCount())

  return (
    <>
    <div className="bg-text-dark min-h-screen p-4">
    <header className="flex justify-between items-center mb-4">
    <div className="flex items-center">
    <Image src={sustainllmicon} alt="SustainLLM Icon" width={24} height={24} className="mr-2" />
    <h1 className="text-text-green text-xl font-MonoSemiBold">SustainLLM</h1>
    </div>
    
    <div className="flex items-center text-text-green font-MonoReg text-sm">
    Made with 
    <span className="mx-1"></span> 
    <div className="text-icon-color mx-1">
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
    >
    <path
      fillRule="evenodd"
      d="M12 4.318C9.403-1.715 1.278 1.32 1.278 6.737c0 2.462 1.23 4.731 3.133 6.666C6.764 15.916 9.03 18.36 12 21c2.97-2.64 5.236-5.084 7.589-7.597 1.903-1.935 3.133-4.204 3.133-6.666 0-5.418-8.125-8.452-10.722-2.419z"
      clipRule="evenodd"
    />
    </svg>
    </div>
    <span className="mx-1"></span>
    at Yale
    </div>

    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl p-4">
    {question && 
    <>
      <h2 className="text-text-green text-sm font-MonoReg">Question</h2>
      <div className='mt-3 p-2 border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light mb-4'>
        <p className="text-text-green text-xs font-bold font-MonoReg">{question}</p>
      </div>
      </>}
    <h2 className="text-text-green text-sm font-MonoReg">Response</h2>
    <div className='max-h-full overflow-y-auto'>
    {isLoading ? (
      <p className="text-center text-text-green text-sm font-MonoReg">Processing your question...</p>

      ) : results.length > 0 ? (
        <>
        <div className='border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light'>
          {results.map((result, idx) => (
            <div key={idx} className="p-2 rounded">
              {result.metadata && (
                <>
                  <p className='text-text-green text-xs font-MonoReg'>{result.metadata.answer}</p>
                </>
              )}
              
            </div>
          ))}
          <div className="flex justify-end">
          <button
            onClick={handleNeedMore}
            className="ml-auto mr-4 mt-2 bg-text-green text-white text-xs font-MonoReg px-3 py-1 rounded-md hover:bg-hover-dark-green"
            disabled={isGettingMoreInfo}
            >
              {isGettingMoreInfo ? "Getting more info..." : "Need More"}
            </button>
          </div>
          <p className='mt-4 p-2 text-text-green text-xs font-MonoReg rounded'>{answer}</p>
                {answer ? 
                
                <div className="flex justify-end">

                <button
                onClick={handleApprove}
                className="ml-auto mb-4 mr-2 border border-text-green bg-transparent text-text-green text-xs font-MonoReg px-3 py-1 rounded-md hover:bg-text-green hover:text-white"
                disabled={isGettingMoreInfo}
                >
                  {isApproved ? "Approved" : "Approve"}
                </button> </div>: ""}
          </div>
        </>
      ) : answer ? (
        <>
        <div className='border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light'>
          <p className="p-4 text-text-green text-xs font-MonoReg rounded">{answer}</p>
        </div>
        </>

    ) : null }

      </div>
      </div>
      
      <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl px-4 pt-4 h-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-text-green text-sm font-MonoReg">Query Vector Visualization</h2>
          <Globe className="text-icon-color" />
        </div>
        <div className='p-4 max-h-96 overflow-y-auto'>

        {isLoading ? (
      <p className="text-center text-text-green text-sm font-MonoReg">Searching vectors...</p>

      ) : results.length > 0 ? (
        <>
        {results.map((result, idx) => (
            <div key={idx} className="relative flex flex-col items-center mb-4">
              {idx !== 0 && ( // Render line for all except the first result
                <div className="absolute -top-4 h-4 w-0.5 bg-grad-dark"></div>
              )}
              <div className="p-4 border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light w-full">
                {result.metadata && (
                  <>
                    <p className="text-text-green text-xs font-MonoReg">
                      <strong>Question:</strong> {result.metadata.question}
                    </p>
                    <p className="text-text-green text-xs font-MonoReg">
                      <strong>Similarity:</strong> {result.score?.toFixed(4)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      ) : results.length == 0 && hasSearched ? (
        <>
          <p className="text-text-green text-xs text-center font-MonoReg">No similar queries found</p>
        </>

    ) : null }
      </div>
      </div>
      
      <div className="bg-gradient-to-b from-grad-light to-grad-dark rounded-2xl p-4">
        <h2 className="text-text-green text-sm font-MonoReg">What your query saved...</h2>
        {/* Metrics content */}
        <div className="bg-white mt-2 from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-16"></div>
      </div>
      
      <div className="bg-gradient-to-b from-grad-light to-grad-dark rounded-2xl p-4">
        <h2 className="text-text-green text-sm font-MonoReg">Daily Projected Savings</h2>
        {/* Savings content */}
        <div className="bg-white mt-2 from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-16"></div>
      </div>
    </div>

    <div className="mt-4 flex items-center">
    <input
      type="text"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="Ask a question..."
      disabled={isLoading}
      className="text-text-green text-sm font-MonoReg w-full p-3 rounded-full border border-icon-color focus:outline-none focus:ring-2 focus:text-green" // Keep the input taller
    />
    <button 
      className="ml-2 bg-text-green text-white font-MonoReg px-8 py-2 rounded-full hover:bg-hover-dark-green"
      onClick={handleSearchAndSave}
      disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Send'}
    </button>
    </div>


    </div>
    </>
  );
}
