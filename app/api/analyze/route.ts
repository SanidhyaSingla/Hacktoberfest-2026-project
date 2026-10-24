import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { code, image } = await req.json();

    const systemInstruction = `You are LogicFlow AI Code Visualizer Engine. Analyze the source code or code screenshot provided and output:
1. A clear high-level overview/summary of what the code architecture does and its auto-detected language.
2. A valid Mermaid.js flowchart mapping out the function calls, control flow, loops, or conditionals.
3. Key highlights/tricky concepts detailing complex algorithms, edge cases, or performance considerations in the code.

CRITICAL MERMAID SYNTAX RULES:
- Begin directly with "graph TD".
- Node labels MUST wrap text in double quotes inside shapes (e.g., NodeA["Check if age >= 18"]).
- Simple alphanumeric node IDs without spaces.
- Do NOT wrap the mermaid string in markdown blocks.

Respond EXCLUSIVELY in valid raw JSON with this exact structure:
{
  "mermaidCode": "graph TD...",
  "overview": "High level architecture summary...",
  "keyHighlights": [
    { "title": "Concept or Edge Case Title", "explanation": "Detailed explanation of how this block behaves..." }
  ]
}`;

    const contents: any[] = [];
    
    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        });
      }
    }

    contents.push(code || 'Analyze and visualize the architecture of the provided code snippet.');

    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: contents,
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
    console.error('Gemini Code API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code logic' },
      { status: 500 }
    );
  }
}