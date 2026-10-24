'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import MermaidChart from '@/components/MermaidChart';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Clean math renderer using KaTeX directly
const MathText = ({ text }: { text: string }) => {
  if (!text) return null;

  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, { throwOnError: false });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={i}>{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const DEFAULT_PROBLEM = `A car accelerates from rest at 3 m/s² for 5 seconds. Calculate its final velocity and total distance traveled.`;

export default function MathSciencePage() {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [diagram, setDiagram] = useState<string>('');
  const [overview, setOverview] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [idealCurvePoints, setIdealCurvePoints] = useState<any[]>([]);
  const [selectedGraphIndex, setSelectedGraphIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Multi-image state array and ref
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle multiple file selections with type safety for FileReader
  const handleFilesInput = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.type.indexOf('image') !== -1) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            setImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle clipboard pasting for multiple/single images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
      handleFilesInput(pastedFiles);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (selectedGraphIndex >= images.length - 1) {
      setSelectedGraphIndex(Math.max(0, images.length - 2));
    }
  };

  const handleSolve = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/math-science', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, images }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.mermaidCode) setDiagram(data.mermaidCode);
        if (data.overview) setOverview(data.overview);
        if (data.steps) setSteps(data.steps);
        if (data.variables) setVariables(data.variables);
        if (data.corrections) setCorrections(data.corrections);
        if (data.idealCurvePoints) setIdealCurvePoints(data.idealCurvePoints);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // SVG Polyline Path generator for ideal curve overlay
  const curveSvgPath = idealCurvePoints.length > 0
    ? idealCurvePoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

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
          {loading ? 'Analyzing Sources...' : 'Solve & Cross-Reference'}
        </button>
      </header>

      {/* Input & Logic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enter Problem / Data Tables / Graph Images
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFilesInput(e.target.files)}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1 border border-slate-700 transition"
            >
              <span>+</span> Attach Images ({images.length})
            </button>
          </div>

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onPaste={handlePaste}
            className="w-full flex-1 bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500 resize-none min-h-[200px]"
            placeholder="Type context, paste text, or paste multiple screenshots/graphs here..."
          />

          {/* Image Upload Previews */}
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedGraphIndex(idx)}
                  className={`relative cursor-pointer rounded-lg border p-0.5 transition ${selectedGraphIndex === idx ? 'border-purple-500 ring-2 ring-purple-500/40' : 'border-slate-700 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Upload ${idx + 1}`} className="h-16 w-16 rounded-md object-cover" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-500 transition shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
              Click "Solve & Cross-Reference" to visualize solution steps
            </div>
          )}
        </div>
      </div>

      {/* SVG Ideal Curve Overlay Card */}
      {images.length > 0 && idealCurvePoints.length > 0 && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-6 shadow-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                🎯 Corrected Ideal Curve Overlay
              </h3>
              <p className="text-xs text-slate-400">
                Green glowing line represents the exact plot derived from your experimental table data.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              Ideal Trace Active
            </span>
          </div>

          <div className="relative inline-block w-full max-w-3xl overflow-hidden rounded-xl border border-slate-700 bg-black/60 shadow-inner">
            <img 
              src={images[selectedGraphIndex] || images[0]} 
              alt="Uploaded Graph" 
              className="w-full h-auto object-contain max-h-[500px]"
            />

            {/* SVG Overlay */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {/* Glowing outer shadow line */}
              <path 
                d={curveSvgPath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeOpacity="0.4"
                className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]"
              />
              {/* Main sharp line */}
              <path 
                d={curveSvgPath} 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="1.2" 
                strokeDasharray="2 1"
              />

              {/* Individual Target Plot Points */}
              {idealCurvePoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="1.8" fill="#34d399" className="animate-pulse" />
                  <circle cx={pt.x} cy={pt.y} r="0.8" fill="#ffffff" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Breakdown: Overview, Corrections, Variables & Steps */}
      {(overview || corrections.length > 0 || steps.length > 0 || variables.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            🧪 Problem Breakdown & Graph Analysis
          </h3>

          {overview && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Problem Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                <MathText text={overview} />
              </p>
            </div>
          )}

          {/* Graph Corrections & Discrepancies */}
          {corrections.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">⚠️ Graph & Data Discrepancies Detected</h4>
              <div className="space-y-3">
                {corrections.map((c: any, idx: number) => (
                  <div key={idx} className="p-4 bg-amber-950/20 rounded-lg border border-amber-500/30 flex flex-col gap-1">
                    <span className="font-semibold text-amber-400 text-xs">
                      Location: <MathText text={c.location} />
                    </span>
                    <p className="text-slate-300 text-sm">
                      <strong className="text-white">Issue:</strong> <MathText text={c.issue} />
                    </p>
                    <p className="text-slate-300 text-sm">
                      <strong className="text-emerald-400">Fix:</strong> <MathText text={c.fix} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {variables.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extracted Variables & Formulas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {variables.map((v, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-indigo-400 text-xs block">
                      <MathText text={v.name} />
                    </span>
                    <span className="text-slate-300 text-sm">
                      <MathText text={v.value} />
                    </span>
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
                      <h5 className="font-semibold text-white text-sm mb-1">
                        <MathText text={step.title} />
                      </h5>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        <MathText text={step.explanation} />
                      </p>
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