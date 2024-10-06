"use client"

import { useState } from 'react';
// import OpenAI from 'openai';
import React from 'react';
import { Globe } from 'lucide-react';
import sustainllmicon from '../app/image/sustainllmicon.png'
import bottle from '../app/image/bottle.png'
import electricity from '../app/image/electricity.png'
import co2 from '../app/image/co2.png'
import phone from '../app/image/phone.png'
import Image from 'next/image';


async function getEmbedding(input: string) {
  const response = await fetch('/api/getEmbedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch embedding');
  }

  const embedding = await response.json();
  return embedding; // Assuming API returns embedding directly
}

async function getGPTResponse(prompt: string) {
  const response = await fetch('/api/getResponse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GPT response');
  }

  const gptResponse = await response.json();
  return gptResponse; // Assuming API returns the GPT content directly
}

interface SearchResultItem {
  score: number,
  metadata?: {
    answer: string;
    question: string;
  };
}
export default function Home() {
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
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
    let charLength = 0;
    if (answer && results) {
      charLength = results.reduce((total, result) => total + (result.metadata?.answer?.length || 0), 0) - answer.length
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

  function calcBottle(characterCount: number): string {
    // Calculate the amount of water used in mL
    const mlPerCharacter: number = (50 / 500)*(14/15) / 500; // 50 mL for 500 characters
    
    const totalML: number = characterCount * mlPerCharacter;

    // Convert to liters if totalML exceeds 1000 mL
    // if (totalML >= 1000) {
    //     const totalLiters: number = totalML / 1000;
    //     return `${totalLiters.toFixed(2)} L Saved`;
    // }

    return `${totalML.toFixed(2)}`;
}  

function calcElectricity(characterCount: number): string {
  const wattsPerCharacter: number = (2.9 / 500)*(14/15); // 2.9 watts for 500 characters
  const totalWatts: number = characterCount * wattsPerCharacter;

  // Convert to kilowatts if total exceeds 1000 watts
  // if (totalWatts > 1000) {
  //     const totalKilowatts = totalWatts / 1000;
  //     return `${totalKilowatts.toFixed(2)} kW Saved`;
  // }

  return `${totalWatts.toFixed(2)}`;
}

function calculateCO2Usage(characterCount: number): string {
  const gramsPerCharacter: number = (2.5 / 500)*(14/15); // 2.5 grams for 500 characters
  const totalGrams: number = characterCount * gramsPerCharacter;

  // Convert to kilograms if total exceeds 1000 grams
  // if (totalGrams > 1000) {
  //     const totalKilograms = totalGrams / 1000;
  //     return `${totalKilograms.toFixed(2)} Kg Saved`;
  // }

  return `${totalGrams.toFixed(2)}`;
}

function calcPhonesCharged(characterCount: number): string {
  const phonesChargedPerCharacter: number = (0.17 / 500)*(14/15); // 0.25 phones charged for 500 characters
  const totalPhonesCharged: number = characterCount * phonesChargedPerCharacter;

  return `${totalPhonesCharged.toFixed(2)}`;
}

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
    <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-[60vh]">
    {question && 
    <>
      <h2 className="text-text-green text-sm font-MonoReg">Question</h2>
      <div className='mt-3 p-2 border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light mb-4'>
        <p className="text-text-green text-xs font-bold font-MonoReg">{question}</p>
      </div>
      </>}
    <h2 className="text-text-green text-sm font-MonoReg">Response</h2>
    <div className='max-h-[40vh] overflow-y-auto'>
    {isLoading ? (
      <p className="text-center text-text-green text-sm font-MonoReg">Processing your question...</p>

      ) : results.length > 0 ? (
        <>
        <div className='border rounded-lg border-grad-dark hover:cursor-pointer hover:bg-hover-light'>
          {results.map((result, idx) => (
            <div key={idx} className="p-2 rounded">
              {result.metadata && (
                <>
                <p className='text-text-green text-xs font-MonoReg'><strong>Response to {idx+1}</strong></p>
                  <p className='text-text-green text-xs font-MonoReg'>{result.metadata?.answer}</p>
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
      
      <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl px-4 pt-4 h-84">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-text-green text-sm font-MonoReg">Query Vector Visualization</h2>
          <Globe className="text-icon-color" />
        </div>
        <div className='p-4 max-h-80 overflow-y-auto'>

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
                      <strong>Question:</strong> {result.metadata?.question}
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
      <h2 className="text-text-green text-sm font-MonoReg">Your query saved...</h2>
      <div className="bg-white mt-2 rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center">
        <Image src={bottle} alt="Bottle" width={24} height={24} className="mr-2" />
        <div>
            <div className="text-text-green text-xs font-MonoReg font-bold">{calcBottle(getCharacterCount())}</div>
            <div className="text-text-green text-xs font-MonoReg">bottles saved</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={electricity} alt="Electricity" width={24} height={24} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">{calcElectricity(getCharacterCount())}</div>
            <div className="text-text-green text-xs font-MonoReg">WH saved</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={co2} alt="Co2" width={30} height={30} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">{calculateCO2Usage(getCharacterCount())}</div>
            <div className="text-text-green text-xs font-MonoReg">grams</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={phone} alt="Phone" width={22} height={22} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">{calcPhonesCharged(getCharacterCount())}</div>
            <div className="text-text-green text-xs font-MonoReg">phones charged</div>
          </div>
        </div>
      </div>
    </div>
  
  <div className="bg-gradient-to-b from-grad-light to-grad-dark rounded-2xl p-4">
    <h2 className="text-text-green text-sm font-MonoReg">Daily Projected Savings</h2>
    {/* Savings content */}
    <div className="bg-white mt-2 rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center">
        <Image src={bottle} alt="Bottle" width={24} height={24} className="mr-2" />
        <div>
            <div className="text-text-green text-xs font-MonoReg font-bold">1,000,000</div>
            <div className="text-text-green text-xs font-MonoReg">bottles saved</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={electricity} alt="Electricity" width={24} height={24} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">29,000</div>
            <div className="text-text-green text-xs font-MonoReg">kWH saved</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={co2} alt="Co2" width={30} height={30} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">10-50</div>
            <div className="text-text-green text-xs font-MonoReg">metric tons</div>
          </div>
        </div>

        <p className='text-icon-color text-xs font-MonoReg'>or</p>
        
        <div className="flex items-center">
        <Image src={phone} alt="Phone" width={22} height={22} className="mr-2" />
          <div>
            <div className="text-text-green text-xs font-bold font-MonoReg">2,500,000</div>
            <div className="text-text-green text-xs font-MonoReg">phones charged</div>
          </div>
        </div>
      </div> 
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
