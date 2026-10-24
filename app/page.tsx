'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Hero */}
      <div className="text-center max-w-3xl mb-12 relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium">
          <span>⚡ Powered by Gemma 4</span>
        </div>
        
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent sm:text-6xl">
          LogicFlow AI
        </h1>
        
        <p className="text-slate-400 text-lg sm:text-xl font-normal leading-relaxed">
          The cross-disciplinary reasoning engine for code architecture, mathematical derivations, and experimental science analysis.
        </p>
      </div>

      {/* Module Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
        
        {/* Module 1: Code Flow Visualizer */}
        <Link 
          href="/flow"
          className="group relative bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300">
              💻
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition flex items-center gap-2">
                Code Logic Visualizer
                <span className="text-xs font-mono font-normal text-slate-500">→</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Paste code or code screenshots in any language. Auto-detect logic, generate Mermaid flowcharts, and break down tricky concepts.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs font-mono text-slate-500 group-hover:text-slate-300 transition">
            <span>Multi-language AST Mapping</span>
            <span>Launch →</span>
          </div>
        </Link>

        {/* Module 2: STEM & Math-Science Engine */}
        <Link 
          href="/math-science"
          className="group relative bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300">
              🧪
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition flex items-center gap-2">
                STEM & Science Engine
                <span className="text-xs font-mono font-normal text-slate-500">→</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Solve complex physics, chemistry, and calculus. Cross-reference observation tables with graphs and adjust real-time simulation parameters.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs font-mono text-slate-500 group-hover:text-slate-300 transition">
            <span>Discrepancy & Simulation Engine</span>
            <span>Launch →</span>
          </div>
        </Link>

      </div>
    </main>
  );
}