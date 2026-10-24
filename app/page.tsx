'use client';

import { useState } from 'react';
import MermaidChart from '@/components/MermaidChart';

const DEFAULT_CODE = `function checkAge(age) {
    if (age >= 18) {
        return "Adult";
    } else {
        return "Minor";
    }
}`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [diagram, setDiagram] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }), // Only sending code now!
      });
      const data = await res.json();
      if (data.mermaidCode) {
        setDiagram(data.mermaidCode);
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
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            LogicFlow AI
          </h1>
          <p className="text-sm text-slate-400">Auto-detects language • Powered by Gemma 4 12B</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Generate Flowchart'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Paste Any Code (Auto-Detect Language)
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none min-h-[300px]"
            placeholder="Paste C++, Python, Rust, TS, Java..."
          />
        </div>

        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Logic Flowchart
          </label>
          {diagram ? (
            <MermaidChart chart={diagram} />
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm min-h-[300px]">
              Click "Generate Flowchart" to visualize logic flow
            </div>
          )}
        </div>
      </div>
    </main>
  );
}