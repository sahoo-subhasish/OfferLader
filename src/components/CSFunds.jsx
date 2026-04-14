import React from 'react';
import { topics } from '../Data/CS-Funds';
import CardCSFund from './CardCSFund';
import { instructions } from '../Data/Instructions';
import StrategyBtn from './StrategyBtn';

const CSFunds = ({}) => {

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto p-4 md:p-6 mb-20 md:pt-12 w-full h-full text-white">
      
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="max-w-xl flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter">
            Computer Fundamentals
          </h1>
          <p className="text-[#888] text-sm leading-relaxed font-medium mb-6">
            Master the essential pillars of computer science: Operating Systems, DBMS, and Computer Networks. This track bridges the gap between everyday coding and core system architecture, giving you the deep theoretical foundation needed to confidently ace technical interviews and truly understand how complex systems operate under the hood.
          </p>
          <StrategyBtn info={instructions[7]} />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight mt-4">Core Topics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <CardCSFund key={topic.id} topic={topic}/>
        ))}
      </div>

    </div>
  );
};

export default CSFunds;
