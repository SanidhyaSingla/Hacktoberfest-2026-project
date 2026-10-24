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

export default function CodeVisualizerPage() {
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800/80 pb-5 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition shadow-sm">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              LogicFlow Code Engine
              <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-semibold tracking-wide">Gemma 4</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Auto-detects language • Instant structural visualizer</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm transition disabled:opacity-50 shadow-xl shadow-indigo-600/25"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:opacity-90 transition duration-300" />
          <span className="relative block px-5 py-2.5 rounded-[11px] bg-slate-950 text-white transition group-hover:bg-opacity-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Logic...
              </span>
            ) : (
              '⚡ Generate Flowchart & Breakdown'
            )}
          </span>
        </button>
      </header>

      {/* Top Section: Code Editor & Flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative z-10">
        
        {/* Code Input Box */}
        <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative group hover:border-slate-700/80 transition duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Source Input
              </label>
            </div>
            
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
              className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border border-indigo-500/30 transition shadow-sm"
            >
              <span className="text-indigo-400 font-bold">+</span> Attach Image
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPaste={handlePaste}
            className="w-full flex-1 bg-slate-950/90 text-indigo-100 font-mono text-sm p-4 rounded-xl border border-slate-800/80 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 resize-none min-h-[260px] shadow-inner"
            placeholder="Paste C++, Python, Rust, TS, Java or code screenshot..."
          />

          {/* Image Preview Thumbnail */}
          {image && (
            <div className="mt-3 relative inline-block w-fit animate-fade-in">
              <img src={image} alt="Upload preview" className="h-20 rounded-xl border border-indigo-500/40 object-cover shadow-md" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition shadow-lg"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Flowchart Box */}
        <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-slate-700/80 transition duration-300">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Logic Flowchart
            </label>
            {diagram && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Rendered Successfully
              </span>
            )}
          </div>
          {diagram ? (
            <div className="flex-1 overflow-auto bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 flex items-center justify-center shadow-inner min-h-[280px]">
              <MermaidChart chart={diagram} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm min-h-[280px] bg-slate-950/40 gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-lg">
                🗺️
              </div>
              <p className="text-xs text-slate-400 font-medium">Click "Generate Flowchart & Breakdown" to visualize logic</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Code Overview & Key Highlights Breakdown */}
      {(overview || keyHighlights.length > 0) && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6 relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-lg">
              🧠
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Intelligent Code Breakdown
              </h3>
              <p className="text-xs text-slate-400">Deep structural insights and logical architecture analysis</p>
            </div>
          </div>
          
          {overview && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Overview</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/90 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                {overview}
              </p>
            </div>
          )}

          {keyHighlights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Tricky Concepts & Key Logic</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyHighlights.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 hover:border-emerald-500/30 transition duration-300 flex flex-col justify-between shadow-md group">
                    <span className="font-bold text-emerald-400 text-sm mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition" />
                      {item.title}
                    </span>
                    <span className="text-slate-300 text-xs leading-relaxed">{item.explanation}</span>
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