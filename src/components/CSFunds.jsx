import React from 'react';
import { topics } from '../Data/CS-Funds';
import CardCSFund from './CardCSFund';

const CSFunds = () => {

  return (
    <div className="w-full h-full p-6 md:p-8 text-white max-w-7xl mx-auto flex flex-col pt-24 md:pt-12">
      
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-center md:text-left text-white tracking-tight">
        Computer Fundamentals
      </h1>

      <article className="mb-20 max-w-4xl font-sans">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white tracking-tight">Approach:</h2>
        
        <ul className="text-[#aaa] text-base md:text-lg leading-relaxed space-y-4 list-disc pl-6 marker:text-white">
          <li className="pl-2">Go through 1 shot videos - Get a gist of the topic</li>
          <li className="pl-2">Go through interview questions 1 by 1 - Read the answer 1-2 times, try to understand the concept.</li>
          <li className="pl-2">
            If you do not understand, use gpt/ gemini and use the following prompt -
            <div className="bg-[#121212] border-l-4 border-white p-5 md:p-6 rounded-r-2xl my-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                   <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM13 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                 </svg>
              </div>
              <p className="italic text-[#e5e5e5] relative z-10 text-sm md:text-base">
                <span className="font-mono text-[13px] md:text-sm bg-black/30 p-2 rounded inline-block border border-white/5 leading-relaxed">"Help me understand the concept and explain it in simple terms as if you would explain it to a 5 year old. Give me an analogy to help me understand the concept or some examples if possible."</span>
              </p>
            </div>
          </li>
          <li className="pl-2">Once you go through the simplified answer, go through the answer again and see if you can understand the concept.</li>
          <li className="pl-2">If you still don't get it, there are concept wise videos available explaining each topic in depth, go to youtube and refer to any playlist from the subject. Preferred Channels: KnowledgeGate, GateSmashers, NesoAcademy.</li>
          <li className="pl-2">Once you cover most of the concepts you will have great clarity of thought.</li>
        </ul>
      </article>

      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white tracking-tight">Core Topics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <CardCSFund key = {topic.id} topic={topic}/>
        ))}
      </div>

    </div>
  );
};

export default CSFunds;
