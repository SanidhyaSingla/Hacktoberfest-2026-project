'use client';

import { useState } from 'react';
import Link from 'next/link';
import MermaidChart from '@/components/MermaidChart';

const DEFAULT_PROBLEM = `A car accelerates from rest at 3 m/s² for 5 seconds. Calculate its final velocity and total distance traveled.`;

export default function MathSciencePage() {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [diagram, setDiagram] = useState<string>('');
  const [overview, setOverview] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/math-science', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.mermaidCode) setDiagram(data.mermaidCode);
        if (data.overview) setOverview(data.overview);
        if (data.steps) setSteps(data.steps);
        if (data.variables) setVariables(data.variables);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              LogicFlow STEM Engine
            </h1>
            <p className="text-sm text-slate-400">Step-by-step Math & Science solver • Powered by Gemma 4</p>
          </div>
        </div>
        <button
          onClick={handleSolve}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
        >
          {loading ? 'Solving...' : 'Solve & Generate Workflow'}
        </button>
      </header>

      {/* Input & Logic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Enter Math / Science Problem
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full flex-1 bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500 resize-none min-h-[300px]"
            placeholder="Paste physics word problems, algebraic equations, or algorithm proofs..."
          />
        </div>

        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Solution Workflow Diagram
          </label>
          {diagram ? (
            <div className="flex-1 overflow-auto bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-center">
              <MermaidChart chart={diagram} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm min-h-[300px]">
              Click "Solve & Generate Workflow" to visualize solution steps
            </div>
          )}
        </div>
      </div>

      {/* Breakdown: Steps & Variables */}
      {(overview || steps.length > 0 || variables.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            🧪 Problem Breakdown & Solution Steps
          </h3>

          {overview && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Problem Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {overview}
              </p>
            </div>
          )}

          {variables.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extracted Variables & Formulas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {variables.map((v, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-indigo-400 text-xs block">{v.name}</span>
                    <span className="text-slate-300 text-sm">{v.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Step-By-Step Solution</h4>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex gap-4 items-start">
                    <div className="bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white text-sm mb-1">{step.title}</h5>
                      <p className="text-slate-300 text-sm leading-relaxed">{step.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}