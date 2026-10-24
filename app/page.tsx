import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          Powered by Gemma 4
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent leading-tight">
          LogicFlow AI
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Visualize complex logic, break down algorithms, and solve multi-step STEM problems with instant flowcharts and explanations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
          {/* Code Visualizer Card */}
          <Link 
            href="/flow" 
            className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-4">💻</div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">
                Code Flow & Breakdown
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Convert source code into interactive Mermaid flowcharts, architectural overviews, and deep concept explanations.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 mt-6 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Visualizer →
            </span>
          </Link>

          {/* Math & Science Card */}
          <Link 
            href="/math-science" 
            className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-4">🧪</div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition">
                Math & Science Solver
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Solve step-by-step STEM equations, extract variables, and generate logic maps for scientific workflows.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-400 mt-6 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch STEM Engine →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}