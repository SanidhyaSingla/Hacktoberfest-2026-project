import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const prompt = `System: Analyze the provided source code (automatically detect its programming language) and convert its logic into a valid Mermaid.js flowchart.

CRITICAL MERMAID SYNTAX RULES:
1. Begin directly with "graph TD".
2. Node labels MUST wrap text in double quotes inside shapes (e.g., NodeA["x == 0?"]).
3. Node IDs must be simple alphanumeric strings without spaces.
4. Do NOT wrap output in markdown codeblocks (no \`\`\`mermaid).
5. Output ONLY raw Mermaid syntax without commentary.

Code to convert:
${code}
`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:12b',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    let mermaidCode = data.response ? data.response.trim() : '';

    mermaidCode = mermaidCode
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .trim();

    return NextResponse.json({ mermaidCode });
  } catch (error) {
    console.error('Ollama connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to local Gemma instance' },
      { status: 500 }
    );
  }
}