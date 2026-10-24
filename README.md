# LogicFlow AI (Hacktoberfest 2026)

My project for participation in Hacktoberfest 2026.

LogicFlow AI takes arbitrary source code, analyzes its control flow using a local LLM (Gemma via Ollama), and visualizes it as an interactive Mermaid.js flowchart.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Prerequisites

- Local [Ollama](https://ollama.ai) instance running at `http://localhost:11434`
- Pull the Gemma model: `ollama pull gemma4:12b`
