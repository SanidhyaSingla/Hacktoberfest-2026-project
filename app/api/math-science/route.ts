import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { problem } = await req.json();

    const systemInstruction = `You are LogicFlow AI STEM Engine. Analyze the math, physics, or scientific problem provided and output:
1. A clear high-level overview/summary of the problem.
2. A step-by-step breakdown solving or deriving the solution.
3. Key variables or formulas identified.
4. A valid Mermaid.js flowchart mapping out the logical solving workflow or system flow.

CRITICAL MERMAID SYNTAX RULES:
- Begin directly with "graph TD".
- Node labels MUST wrap text in double quotes inside shapes (e.g., NodeA["Calculate Velocity"]).
- Simple alphanumeric node IDs without spaces.
- Do NOT wrap the mermaid string in markdown blocks.

Respond EXCLUSIVELY in valid raw JSON with this exact structure:
{
  "mermaidCode": "graph TD...",
  "overview": "High level problem summary...",
  "steps": [
    { "stepNumber": 1, "title": "Step title", "explanation": "Detailed explanation..." }
  ],
  "variables": [
    { "name": "Variable/Formula name", "value": "Value or expression description" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: `Problem to solve:\n${problem}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text ? response.text.trim() : '{}';
    const parsedData = JSON.parse(rawText);

    if (parsedData.mermaidCode) {
      parsedData.mermaidCode = parsedData.mermaidCode
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .trim();
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Gemini STEM API error:', error);
    return NextResponse.json(
      { error: 'Failed to solve STEM problem' },
      { status: 500 }
    );
  }
}