import React from 'react';
import { LeafyGreen, Globe } from 'lucide-react';
import sustainllmicon from '../app/image/sustainllmicon.png'
import Image from 'next/image';


const SustainLLM = () => {
  return (
    <div className="bg-text-dark min-h-screen p-4">
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center">
        <Image src={sustainllmicon} alt="SustainLLM Icon" width={24} height={24} className="mr-2" />
        <h1 className="text-text-green text-xl font-MonoSemiBold">SustainLLM</h1>
        </div>
        <div className="flex items-center text-text-green font-MonoReg text-sm">
  Made with  
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
   at Yale
</div>

      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-96">
          {/* Main content area */}
        </div>
        
        <div className="bg-gradient-to-b from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-text-green text-sm font-MonoReg">Query Graph Visualization</h2>
            <Globe className="text-icon-color" />
          </div>
          {/* Graph visualization area */}
        </div>
        
        <div className="bg-gradient-to-b from-grad-light to-grad-dark rounded-2xl p-4">
          <h2 className="text-text-green text-sm font-MonoReg">Sustainability Metrics</h2>
          {/* Metrics content */}
          <div className="bg-white mt-2 from-grad-light via-grad-light to-grad-dark rounded-xl p-4 h-16"></div>
        </div>
        
        <div className="bg-gradient-to-b from-grad-light to-grad-dark rounded-2xl p-4">
          <h2 className="text-text-green text-sm font-MonoReg">Total Savings</h2>
          {/* Savings content */}
          <div className="bg-white mt-2 from-grad-light via-grad-light to-grad-dark rounded-2xl p-4 h-16"></div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
  <input
    type="text"
    className="text-text-green text-sm font-MonoReg w-full p-3 rounded-full border border-icon-color focus:outline-none focus:ring-2 focus:text-green" // Keep the input taller
    placeholder="Message SustainLLM"
  />
  <button className="ml-2 bg-text-green text-white font-MonoReg px-8 py-2 rounded-full">
    Send
  </button>
</div>


    </div>
  );
};

export default SustainLLM;