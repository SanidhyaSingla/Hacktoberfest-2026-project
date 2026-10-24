import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { problem, images } = await req.json();

    const systemInstruction = `You are LogicFlow AI STEM Engine. Analyze the math, physics, or scientific problem provided (via text or multiple images) and output:
1. A clear high-level overview/summary of the problem.
2. A step-by-step breakdown solving or deriving the solution.
3. Key variables or formulas identified using standard LaTeX notation (e.g., $v_0$, $a$, $d = v_0 t + \\frac{1}{2}at^2$).
4. A valid Mermaid.js flowchart mapping out the logical solving workflow.
5. If images containing graphs, charts, or data tables are uploaded alongside problem text, cross-reference them and detect visual plotting discrepancies or incorrect trendlines.

CRITICAL FORMATTING RULES:
- For mathematical expressions, variables, and formulas, ALWAYS use valid LaTeX notation formatted inside dollar signs (e.g. $v_0$, $v_f$, $m/s^2$, $a = 3 \\text{ m/s}^2$).

CRITICAL MERMAID SYNTAX RULES:
- Begin directly with "graph TD".
- Node labels MUST wrap text in double quotes inside shapes (e.g., NodeA["Calculate Velocity $v_0$"]).
- Simple alphanumeric node IDs without spaces.
- Do NOT wrap the mermaid string in markdown blocks.

CRITICAL GRAPH & DATA DISCREPANCY ANALYSIS:
- If the user provides multiple images (e.g. a graph image and a table image), cross-reference them together.
- Identify visual discrepancies or plotting errors in the user's graph compared to the true data values from the table.
- Return a "corrections" array detailing exactly where the user's graph needs adjustment. If no discrepancies exist or no graph is provided, return an empty array [].

Respond EXCLUSIVELY in valid raw JSON with this exact structure:
{
  "mermaidCode": "graph TD...",
  "overview": "High level problem summary...",
  "steps": [
    { "stepNumber": 1, "title": "Step title", "explanation": "Detailed explanation with LaTeX $equations$..." }
  ],
  "variables": [
    { "name": "Variable or Formula", "value": "LaTeX value string" }
  ],
  "corrections": [
    { "location": "e.g. at t = 3s or point (3, 15)", "issue": "Graph curve shows y = 10, but table specifies y = 15", "fix": "Shift plot point up to y = 15 to reflect accurate slope" }
  ]
}`;

    const contents: any[] = [];
    
    // Support multiple image inputs
    if (images && Array.isArray(images)) {
      images.forEach((img: string) => {
        const matches = img.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          contents.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      });
    }

    contents.push(problem || 'Analyze and solve the STEM problem or cross-reference the provided images.');

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
    console.error('Gemini STEM API error:', error);
    return NextResponse.json(
      { error: 'Failed to solve STEM problem' },
      { status: 500 }
    );
  }
}