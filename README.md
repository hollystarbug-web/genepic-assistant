# Genepic AI Assistant
**OpenAI Agents SDK + Responses API · Vercel**

A streaming AI chat agent for the Genepic peptide business — built with the OpenAI Agents SDK, Responses API, and deployed on Vercel.

---

## Stack

| Layer | Technology |
|-------|------------|
| **Agent Framework** | `@openai/agents-core` (Agents SDK) |
| **OpenAI Provider** | `@openai/agents-openai` (Responses + Chat Completions) |
| **UI Streaming** | `ai` SDK (Vercel AI SDK — `useChat` hook) |
| **Frontend** | Next.js 16 (App Router) + React 19 |
| **Deployment** | Vercel |

---

## Setup

### 1. Add your API key

```bash
# Edit .env.local
OPENAI_API_KEY=sk-...your_key...
```

Get your key at: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 2. Install

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
npm run deploy
```

Or connect your GitHub repo to Vercel for auto-deployments.

---

## Current Agent Capabilities

| Tool | Status | Description |
|------|--------|-------------|
| `web_search` | ⚠️ Needs wiring | Search for competitor data, scientific research, market info |
| `research_peptide` | ⚠️ Needs wiring | Deep research on specific peptides |
| `write_content` | ⚠️ Needs wiring | Generate Genepic brand copy |
| `calculate_price` | ✅ Working | Cost + margin pricing calculator |

---

## Architecture

```
app/
  page.tsx              ← Chat UI (useChat hook)
  layout.tsx            ← Root layout
  api/agent/route.ts   ← Streaming agent endpoint

agents/
  index.ts              ← Agent definition + tools

.env.local              ← OPENAI_API_KEY
```

---

## Next Steps

1. Wire the `web_search` tool to FireCrawl, Tavily, or Perplexity API
2. Wire `research_peptide` to a scientific literature source
3. Connect `write_content` to GPT-4o with Genepic brand copy guidelines
4. Add guardrails for legal/health disclaimers
5. Connect to Stripe for the Genepic peptide business
