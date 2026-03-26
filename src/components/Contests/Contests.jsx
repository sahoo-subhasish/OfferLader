// src/pages/Contests.jsx
import React from 'react';

export default function Contests() {
  return (
    <section className="flex flex-col items-center justify-center h-full text-[#888] mt-20">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      <h1 className="text-2xl font-bold text-white mb-2">Contests</h1>
      <p>Weekly and Bi-weekly contests will appear here soon.</p>
    </section>
  );
}