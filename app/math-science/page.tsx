'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MermaidChart from '@/components/MermaidChart';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

const DEFAULT_PROBLEM = `A copper wire of 10^-6 m2 area of cross section, carries a current of 2 A. If the number of electrons per cubic meter is 8 × 10^28, calculate the current density and average drift velocity.`;

export default function MathSciencePage() {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [diagram, setDiagram] = useState<string>('');
  const [overview, setOverview] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [simulationParams, setSimulationParams] = useState<any[]>([]);
  const [simulationOutputs, setSimulationOutputs] = useState<any[]>([]);
  const [simValues, setSimValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safely initialize slider states and sanitize extreme bounds
  useEffect(() => {
    if (simulationParams && simulationParams.length > 0) {
      const initialValues: Record<string, number> = {};
      simulationParams.forEach((param) => {
        let def = Number(param.default);
        if (isNaN(def)) def = 1;
        initialValues[param.key] = def;
      });
      setSimValues(initialValues);
    }
  }, [simulationParams]);

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
        setDiagram(data.mermaidCode || '');
        setOverview(data.overview || '');
        setSteps(data.steps || []);
        setVariables(data.variables || []);
        setCorrections(data.corrections || []);
        setSimulationParams(data.simulationParams || []);
        setSimulationOutputs(data.simulationOutputs || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateExpression = (expr: string) => {
    try {
      let cleanExpr = expr.replace(/\^/g, '**');
      const keys = Object.keys(simValues);
      const values = Object.values(simValues);
      if (keys.length === 0) return 'N/A';
      
      // eslint-disable-next-line no-new-func
      const evalFn = new Function(...keys, `return ${cleanExpr};`);
      const result = evalFn(...values);
      return isNaN(result) ? 'N/A' : Number(result).toExponential(3);
    } catch (e) {
      return 'Calc Error';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800/80 pb-5 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition shadow-sm">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              LogicFlow STEM Engine 
              <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-semibold tracking-wide">Gemma 4</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Advanced Step-by-Step Math, Physics & Chemistry Solver</p>
          </div>
        </div>
        <button
          onClick={handleSolve}
          disabled={loading}
          className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm transition disabled:opacity-50 shadow-xl shadow-purple-600/25"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 group-hover:opacity-90 transition duration-300" />
          <span className="relative block px-5 py-2.5 rounded-[11px] bg-slate-950 text-white transition group-hover:bg-opacity-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Sources...
              </span>
            ) : (
              '⚡ Solve Problem'
            )}
          </span>
        </button>
      </header>

      {/* Top Grid: Input & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative z-10">
        
        {/* Input Box */}
        <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative group hover:border-slate-700/80 transition duration-300">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Problem Description & Lab Data
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
              className="cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border border-purple-500/30 transition shadow-sm"
            >
              <span className="text-purple-400 font-bold">+</span> Attach Images ({images.length})
            </button>
          </div>

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onPaste={handlePaste}
            className="w-full flex-1 bg-slate-950/90 text-purple-100 font-mono text-sm p-4 rounded-xl border border-slate-800/80 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50 resize-none min-h-[220px] shadow-inner"
            placeholder="Type text context, paste formula notes, or drop multiple screenshots & graph plots here..."
          />

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2.5 animate-fade-in">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl border border-purple-500/40 p-0.5 bg-slate-950 shadow-md">
                  <img src={img} alt={`Upload ${idx + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Diagram Box */}
        <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-slate-700/80 transition duration-300">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Solution Workflow Diagram
            </label>
            {diagram && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Mermaid Compiled
              </span>
            )}
          </div>
          {diagram ? (
            <div className="flex-1 overflow-auto bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 flex items-center justify-center shadow-inner min-h-[260px]">
              <MermaidChart chart={diagram} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm min-h-[260px] bg-slate-950/40 gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-lg">
                🗺️
              </div>
              <p className="text-xs text-slate-400 font-medium">Click "Solve Problem" to visualize derivation logic</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Simulation Engine */}
      {simulationParams.length > 0 && simulationOutputs.length > 0 && (
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl p-6 shadow-2xl mb-6 relative z-10 overflow-hidden">
          {/* Subtle Accent Backdrop */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-center mb-5 relative z-10">
            <div>
              <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-base">⚡</span>
                Interactive "What-If" Simulation Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust variables live on the client side to instantly track calculation shifts.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4 bg-slate-950/90 p-5 rounded-xl border border-slate-800/80 shadow-inner">
              {simulationParams.map((param) => {
                let rawMin = Number(param.min);
                let rawMax = Number(param.max);
                let currentVal = simValues[param.key] ?? Number(param.default) ?? 1;

                if (isNaN(rawMin) || isNaN(rawMax) || rawMin >= rawMax) {
                  rawMin = 0;
                  rawMax = currentVal > 0 ? currentVal * 2 : 100;
                }
                if (rawMax - rawMin > 1e6 || rawMax > 1e6) {
                  rawMin = 0;
                  rawMax = currentVal * 2 || 100;
                }
                const step = (rawMax - rawMin) / 100 || 1;

                return (
                  <div key={param.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-medium"><MathText text={param.label} /></span>
                      <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {typeof currentVal === 'number' && currentVal > 1e4 ? currentVal.toExponential(2) : currentVal}
                      </span>
                    </div>
                    <input 
                      type="range"
                      min={rawMin}
                      max={rawMax}
                      step={step}
                      value={currentVal}
                      onChange={(e) => setSimValues({ ...simValues, [param.key]: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer bg-slate-900 h-2 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-xl p-5 flex flex-col justify-center items-center text-center shadow-inner">
              <span className="text-[11px] uppercase tracking-widest font-mono text-indigo-300 mb-4 font-bold flex items-center gap-1.5">
                <span>📈</span> Real-Time Simulation Output
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {simulationOutputs.map((out, idx) => (
                  <div key={idx} className="bg-slate-950/90 p-3.5 rounded-xl border border-indigo-500/20 shadow-md group hover:border-emerald-500/40 transition duration-300">
                    <span className="text-[11px] text-slate-400 block mb-1"><MathText text={out.label} /></span>
                    <span className="text-base font-black text-emerald-400 font-mono tracking-tight group-hover:scale-105 transition duration-300 inline-block">
                      {evaluateExpression(out.expression)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown, Corrections, Variables & Steps */}
      {(overview || corrections.length > 0 || steps.length > 0 || variables.length > 0) && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6 relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-lg">
              🧪
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Problem Breakdown & Analysis
              </h3>
              <p className="text-xs text-slate-400">Comprehensive derivation steps, extracted variables, and experimental checks</p>
            </div>
          </div>

          {overview && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Problem Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/90 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                <MathText text={overview} />
              </p>
            </div>
          )}

          {corrections.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-md shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-200">Experimental Discrepancies & Error Checks</h3>
                </div>
              </div>

              <div className="space-y-3">
                {corrections.map((item: any, index: number) => (
                  <div key={index} className="p-4 rounded-xl bg-black/50 border border-amber-500/20 shadow-inner">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20 font-semibold">
                      <MathText text={item.location} />
                    </span>
                    <p className="mt-2.5 text-xs text-zinc-300"><strong className="text-white font-semibold">Issue:</strong> <MathText text={item.issue} /></p>
                    <p className="mt-1.5 text-xs text-emerald-400"><strong className="text-white font-semibold">Recommended Fix:</strong> <MathText text={item.fix} /></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {variables.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Extracted Variables & Formulas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {variables.map((v, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition duration-300 shadow-sm">
                    <span className="font-bold text-indigo-400 text-xs block mb-1">
                      <MathText text={v.name} />
                    </span>
                    <span className="text-slate-300 text-sm font-mono font-medium">
                      <MathText text={v.value} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Step-By-Step Solution Derivation</h4>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 flex gap-4 items-start hover:border-purple-500/30 transition duration-300 shadow-md">
                    <div className="bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold rounded-xl w-8 h-8 flex items-center justify-center shrink-0 text-sm shadow-sm font-mono">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-white text-sm tracking-tight">
                        <MathText text={step.title} />
                      </h5>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
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