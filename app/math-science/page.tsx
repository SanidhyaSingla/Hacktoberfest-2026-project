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
          {loading ? 'Analyzing Sources...' : 'Solve Problem'}
        </button>
      </header>

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

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-lg border border-slate-700 p-0.5">
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
              Click "Solve Problem" to visualize solution steps
            </div>
          )}
        </div>
      </div>

      {simulationParams.length > 0 && simulationOutputs.length > 0 && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-6 shadow-2xl mb-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                ⚡ Interactive "What-If" Simulation Engine
              </h3>
              <p className="text-xs text-slate-400">
                Adjust variables live on the client side to simulate calculation shifts instantly.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full">
              Live Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {simulationParams.map((param) => {
                // Sanitize min/max bounds so sliders never break on extreme numbers
                let rawMin = Number(param.min);
                let rawMax = Number(param.max);
                let currentVal = simValues[param.key] ?? Number(param.default) ?? 1;

                if (isNaN(rawMin) || isNaN(rawMax) || rawMin >= rawMax) {
                  rawMin = 0;
                  rawMax = currentVal > 0 ? currentVal * 2 : 100;
                }
                // If bounds are ridiculously wide (scientific notation range), create a safe proportional range around currentVal
                if (rawMax - rawMin > 1e6 || rawMax > 1e6) {
                  rawMin = 0;
                  rawMax = currentVal * 2 || 100;
                }
                const step = (rawMax - rawMin) / 100 || 1;

                return (
                  <div key={param.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300"><MathText text={param.label} /></span>
                      <span className="text-indigo-400 font-bold">
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
                      className="w-full accent-indigo-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>

            <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-xs uppercase tracking-wider font-mono text-indigo-300 mb-3">Real-Time Simulation Output</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {simulationOutputs.map((out, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-indigo-500/20">
                    <span className="text-xs text-slate-400 block"><MathText text={out.label} /></span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {evaluateExpression(out.expression)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(overview || corrections.length > 0 || steps.length > 0 || variables.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            🧪 Problem Breakdown & Analysis
          </h3>

          {overview && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Problem Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                <MathText text={overview} />
              </p>
            </div>
          )}

          {corrections.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200">Experimental Discrepancies</h3>
                </div>
              </div>

              <div className="space-y-3">
                {corrections.map((item: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-black/40 border border-amber-500/20">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                      <MathText text={item.location} />
                    </span>
                    <p className="mt-2 text-sm text-zinc-300"><strong className="text-white">Issue:</strong> <MathText text={item.issue} /></p>
                    <p className="mt-1 text-sm text-emerald-400"><strong className="text-white">Recommended Fix:</strong> <MathText text={item.fix} /></p>
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