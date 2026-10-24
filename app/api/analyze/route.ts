import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const systemInstruction = `You are LogicFlow AI. Analyze the user's code and provide:
1. A valid Mermaid.js flowchart.
2. A clear explanation of how the code works.
3. Key highlights explaining complex or tricky concepts/logic in the code.

CRITICAL MERMAID SYNTAX RULES:
- Begin directly with "graph TD".
- Node labels MUST wrap text in double quotes inside shapes (e.g., NodeA["x == 0?"]).
- Simple alphanumeric node IDs without spaces.
- Do NOT wrap the mermaid string in code blocks.

Respond EXCLUSIVELY in valid raw JSON with this exact structure:
{
  "mermaidCode": "graph TD...",
  "overview": "Brief high-level summary of what the code does...",
  "keyHighlights": [
    { "title": "Concept/Function Name", "explanation": "Detailed breakdown..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: `Code to analyze:\n${code}`,
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
    console.error('Gemini API connection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}