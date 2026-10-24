# 🚀 LogicFlow AI STEM Engine

## 💡 What is LogicFlow AI?

**LogicFlow AI** is a dynamic, cross-disciplinary STEM engine built to transform static homework problems, experimental lab data, and graph plots into an interactive engineering workspace.

Instead of acting like a standard text-box chatbot that spits out static answers, LogicFlow parses complex math, physics, and chemistry problems into structured logic steps, cross-references lab observation tables with graph data for error detection, and instantly spins up live, client-side simulation workspaces with tunable parameters.

---

## 🔥 Why LogicFlow Beats ChatGPT or Standard Gemini

Standard LLMs give you a dead block of text and stop there. If you want to change a variable or check a lab variation, you have to prompt them all over again. LogicFlow treats problem-solving like a true engineering workstation:

* **⚡ Interactive "What-If" Simulation Engine:** It extracts tunable variables and raw mathematical expressions from any problem domain. Dragging the live range sliders recalculates final values instantly on the client side without hammering the API again.
* **🧪 Automated Experimental Verification & Discrepancies:** Drop your lab observation tables and hand-drawn graph plots side-by-side. The engine cross-references recorded data against plotted characteristics to flag scaling errors, intercept mismatches, or curve deviations.
* **🗺️ Structural Workflow Mapping:** Every problem automatically compiles into a clean, interactive **Mermaid.js logic flowchart** mapping out the exact path from given variables to final derivations.
* **📐 Pristine Mathematical Rendering:** Uses direct **KaTeX** integration so all equations, variables, and scientific notation render cleanly instead of displaying messy raw text.

---

## 🛠️ Core Features

1. **Multi-Source Ingestion:** Type text problems, paste code/data, or drop multiple screenshots and lab graphs directly via clipboard or file uploads.
2. **Discrepancy & Error Engine:** Pinpoints experimental lab errors between recorded table values and graphical representations.
3. **Dynamic Client-Side Evaluator:** Safely parses and evaluates parametric formulas in real-time across physics, electrical engineering, chemistry, and mathematics.
4. **Responsive Glassmorphism UI:** Built with Tailwind CSS and Next.js App Router for a lightning-fast dark-mode developer experience.

---

## 🧰 Tech Stack & Resources

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
* **AI Model:** Google GenAI SDK (`gemma-4-26b-a4b-it`) for structured JSON reasoning.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Diagramming:** [Mermaid.js](https://mermaid.js.org/) for logic flowcharts.
* **Math Rendering:** [KaTeX](https://katex.org/) for high-performance LaTeX typesetting.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** installed on your machine along with a valid Google Gemini API Key.

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/logicflow-ai/logicflow-ai.git
   cd logicflow-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Create a `.env.local` file in the root directory of your project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to experience the STEM engine live.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with power and precision for STEM students and developers.
</div>