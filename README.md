# Aether AI — Intelligent Neural Workspace

> An ethereal, production-ready AI workspace uniting multimodal neural chat, persistent session management, scheduled task workflows, real-time token tracking, and system telemetry diagnostics.

---

## 1. What It Does

Aether AI is a full-featured web application that provides a unified environment for conversational artificial intelligence, document intelligence, and productivity management.

* **Multimodal Neural Chat**:
  * Seamless conversational interface powered by Google Gemini.
  * Multi-mode interaction:
    * **Chat Mode**: Standard conversational intelligence and problem-solving.
    * **Imagine Mode**: Generative visual and creative concept synthesis.
    * **Deep Analysis Mode**: Technical document dissection and automated code inspection.
* **Persistent Session Management**:
  * Create, rename, duplicate, pin, search, and delete multiple conversation threads.
  * Complete client-side storage persistence across browser reloads.
* **Session Exporting**:
  * One-click export of entire conversation histories as **Markdown (`.md`)** or **Plain Text (`.txt`)**.
  * Customizable options for including timestamps, system metadata, and attachment summaries, plus integrated clipboard copying.
* **Smart File Attachment Staging**:
  * Drag-and-drop document and image upload (supporting PDFs, text files, markdown, images, and JSON).
  * Interactive file staging bar inside the input box with file thumbnails, file size indicators, single-item deletion, and an instant **"Don't add files"** discard control.
* **Scheduled To-Do Workflows**:
  * Built-in task planner with due dates, priority labels, and completion tracking.
  * AI-powered task extraction: converts actionable steps from chat conversations directly into scheduled to-dos.
* **Real-time Token Usage & Pro Tier Monitoring**:
  * Continuous tracking of API token consumption against tiered limits (e.g., 1,000,000 baseline tokens).
  * Visual progress bar, high-usage warning thresholds, and interactive upgrade simulation.
* **System Architecture & Telemetry Report**:
  * Dedicated interactive system report (`/report`) featuring cluster status, real-time metrics, node latency, and export-to-PDF capabilities.

---

## 2. What It Is Used For

Aether AI is designed for operators, engineers, and creators who need a focused workspace combining AI generation with day-to-day execution:

| Use Case | Description |
| :--- | :--- |
| **Software Architecture & Code Analysis** | Analyze whitepapers, debug code snippets, and evaluate system scalability using the *Neural Architect* preset. |
| **Document & Data Analysis** | Attach technical PDFs, logs, markdown specs, or spreadsheets to extract key insights, summarize findings, and inspect structured data. |
| **Project & Task Execution** | Turn conversational brainstorming into tangible, scheduled to-dos with due dates and calendar tracking. |
| **Technical Documentation & Archiving** | Export curated AI conversations directly into version-controlled Markdown notes for developer wikis or meeting records. |
| **API Cost & Token Monitoring** | Track resource consumption in real-time to simulate usage costs and monitor usage limits. |

---

## 3. Why Use Aether AI

* **All-in-One Convergence**: Bridges the gap between AI generation and task management. You don't just chat with AI—you turn solutions into actionable scheduled tasks and documented Markdown files.
* **Zero Attachment Anxiety**: The smart staging bar shows exactly what files are attached before sending, allowing you to remove individual files or clear all attachments with one click if you decide not to include them.
* **Transparent Token Economy**: Built-in visual token consumption metrics eliminate guesswork regarding API quotas and limits.
* **Frictionless Portability**: Download discussions cleanly formatted in Markdown or plain text without manual copying or reformatting.
* **Refined Aesthetics**: Crafted with a modern, high-contrast ethereal dark aesthetic, smooth spring physics animations, and intuitive responsive navigation.

---

## 4. Technology Stack

* **Framework & Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Motion & Transitions**: [Motion](https://motion.dev/) (Framer Motion)
* **AI Model Integration**: [@google/genai SDK](https://www.npmjs.com/package/@google/genai)
* **Diagrams & Visualizations**: [Mermaid](https://mermaid.js.org/) & [react-mermaid2](https://github.com/mermaid-js/mermaid)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)

---

## 5. Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm or pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key in your environment
# (GEMINI_API_KEY is read server-side or via your development configuration)
export GEMINI_API_KEY="your-api-key-here"

# 3. Start development server
npm run dev
```

The application runs on `http://localhost:3000`.

### Build & Production

```bash
# Build production bundle
npm run build

# Run TypeScript linter
npm run lint

# Preview production build
npm run preview
```
