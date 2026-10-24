'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
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
  const [overview, setOverview] = useState<string>('');
  const [keyHighlights, setKeyHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Image state variables and ref
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection or clipboard paste
  const handleImageInput = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageInput(file);
      }
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, image }),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.mermaidCode) setDiagram(data.mermaidCode);
        if (data.overview) setOverview(data.overview);
        if (data.keyHighlights) setKeyHighlights(data.keyHighlights);
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              LogicFlow AI
            </h1>
            <p className="text-sm text-slate-400">Auto-detects language • Powered by Gemma 4</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          {loading ? 'Analyzing Logic...' : 'Generate Flowchart & Breakdown'}
        </button>
      </header>

      {/* Top Section: Code Editor & Flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Paste Any Code (Auto-Detect Language)
            </label>
            
            {/* Hidden file input controlled by useRef */}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0])}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1 border border-slate-700 transition"
            >
              <span>+</span> Attach Image
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPaste={handlePaste}
            className="w-full flex-1 bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none min-h-[240px]"
            placeholder="Paste C++, Python, Rust, TS, Java or paste a code screenshot..."
          />

          {/* Image Preview Thumbnail */}
          {image && (
            <div className="mt-3 relative inline-block w-fit">
              <img src={image} alt="Upload preview" className="h-20 rounded-lg border border-slate-700 object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-500 transition shadow"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Logic Flowchart
          </label>
          {diagram ? (
            <div className="flex-1 overflow-auto bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-center">
              <MermaidChart chart={diagram} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm min-h-[300px]">
              Click "Generate Flowchart & Breakdown" to visualize logic flow
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Code Overview & Key Highlights Breakdown */}
      {(overview || keyHighlights.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            🧠 Intelligent Code Breakdown
          </h3>
          
          {overview && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overview</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {overview}
              </p>
            </div>
          )}

          {keyHighlights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tricky Concepts & Key Logic</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyHighlights.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="font-semibold text-emerald-400 text-sm mb-1">{item.title}</span>
                    <span className="text-slate-300 text-sm">{item.explanation}</span>
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