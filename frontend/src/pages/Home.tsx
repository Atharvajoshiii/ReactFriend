import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ReactFriend
          </h1>
          <p className="text-lg text-gray-300">
            Your Friend To build React Apps 
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg p-6 flex flex-col justify-center items-center">
          <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full min-h-[160px] p-6 bg-black text-white border border-gray-800 
              rounded-lg resize-none placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
              transition-all duration-200 ease-in-out
              text-lg leading-relaxed
              shadow-lg hover:shadow-xl
              backdrop-blur-sm
              hover:border-gray-600"
            />
            <button
              type="submit"
              className=" mt-4 bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}