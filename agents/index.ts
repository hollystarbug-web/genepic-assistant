/**
 * Genepic Agent — built with OpenAI Agents SDK + Responses API.
 */

import OpenAI from 'openai'
import { Agent, tool, run, Model, ModelProvider, setDefaultModelProvider } from '@openai/agents-core'
import { setDefaultOpenAIKey, OpenAIResponsesModel } from '@openai/agents-openai'
import { z } from 'zod'

// ─── OpenAI model provider ─────────────────────────────────────────────────────

function createOpenAIModelProvider(apiKey: string): ModelProvider {
  const client = new OpenAI({ apiKey })

  return {
    getModel(modelName?: string): Model {
      return new OpenAIResponsesModel(client, modelName ?? 'gpt-4o')
    },
  }
}

// ─── Ensure API key + default provider ─────────────────────────────────────────

let providerCache: ModelProvider | null = null

function ensureProvider(): ModelProvider {
  if (providerCache) return providerCache

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in .env.local')

  setDefaultOpenAIKey(apiKey)
  providerCache = createOpenAIModelProvider(apiKey)
  setDefaultModelProvider(providerCache)
  return providerCache
}

// ─── Tools ─────────────────────────────────────────────────────────────────────

const searchTool = tool({
  name: 'web_search',
  description:
    'Search the web for current information — competitor prices, scientific research, market data, or any topic requiring up-to-date facts.',
  parameters: z.object({
    query: z.string().describe('The search query'),
    num_results: z.number().optional().default(5).describe('Number of results'),
  }),
  execute: async ({ query }) => {
    // TODO: wire to FireCrawl, Tavily, SerpAPI, or Perplexity
    return {
      query,
      results: [],
      note: '⚠️ Search tool not yet wired to a live API. Please search manually and report findings.',
    }
  },
})

const researchPeptideTool = tool({
  name: 'research_peptide',
  description:
    'Research a peptide: mechanism of action, typical research dosages, competitor pricing, legal status, and market positioning.',
  parameters: z.object({
    peptide_name: z.string().describe('Name of the peptide'),
    angle: z
      .string()
      .optional()
      .default('all')
      .describe('mechanism | dosage | competitors | legal | all'),
  }),
  execute: async ({ peptide_name, angle }) => {
    return {
      peptide: peptide_name,
      angle: angle ?? 'all',
      status: 'placeholder',
      note: '⚠️ Research tool needs a live data source (e.g. scientific literature API, competitor scraper).',
    }
  },
})

const writeContentTool = tool({
  name: 'write_content',
  description:
    'Write website copy, product descriptions, email sequences, or marketing content for Genepic.',
  parameters: z.object({
    content_type: z.string().describe(
      'product_description | homepage_headline | email_sequence | ad_copy | blog_post'
    ),
    product_or_topic: z.string().describe('Product or topic to write about'),
    tone: z.string().optional().default('scientific but accessible'),
    word_count: z.number().optional().default(300),
  }),
  execute: async ({ content_type, product_or_topic, tone, word_count }) => {
    return {
      content_type,
      topic: product_or_topic,
      tone: tone ?? 'scientific but accessible',
      word_count: word_count ?? 300,
      status: 'placeholder',
      note: '⚠️ Content tool needs to be wired to GPT-4o with Genepic brand copy guidelines.',
    }
  },
})

const calculatePriceTool = tool({
  name: 'calculate_price',
  description:
    'Calculate retail or wholesale pricing for a peptide based on raw cost and margin benchmarks.',
  parameters: z.object({
    peptide: z.string().describe('Peptide name'),
    cost_per_gram: z.number().describe('Cost per gram of raw peptide powder'),
    batch_size_grams: z.number().optional().default(1),
    margin_type: z
      .string()
      .optional()
      .default('retail')
      .describe('retail | wholesale'),
    competitor_price_per_unit: z.number().optional().describe('Known competitor price for benchmarking'),
  }),
  execute: async ({
    peptide,
    cost_per_gram,
    batch_size_grams,
    margin_type,
    competitor_price_per_unit,
  }) => {
    const qty_mg = (batch_size_grams ?? 1) * 1000
    const base_cost = cost_per_gram * (batch_size_grams ?? 1)
    const margins = { retail: 3.5, wholesale: 1.8 }
    const margin = margins[(margin_type ?? 'retail') as keyof typeof margins] ?? 3.5
    const suggested = Math.round(base_cost * margin * 100) / 100
    const per_100mg = Math.round((suggested / qty_mg) * 100 * 100) / 100

    return {
      peptide,
      batch_size_grams: batch_size_grams ?? 1,
      cost_per_gram_usd: cost_per_gram,
      base_cost_usd: Math.round(base_cost * 100) / 100,
      margin_applied: margin,
      margin_type: margin_type ?? 'retail',
      suggested_price_usd: suggested,
      price_per_100mg: `$${per_100mg}`,
      competitor_benchmark: competitor_price_per_unit
        ? `$${competitor_price_per_unit}`
        : 'not provided',
      status: 'calculated ✅',
    }
  },
})

// ─── Agent ─────────────────────────────────────────────────────────────────────

export const genepicAgent = Agent.create({
  name: 'Genepic Assistant',
  instructions: `You are the Genepic AI — a knowledgeable, precise, and helpful AI assistant for the Genepic peptide e-commerce business.

Genepic sells research-grade peptides to scientists, biohackers, and clinics.
Brand voice: Scientific but accessible. Professional and trustworthy. Clean and modern.
Never clinical or pharmaceutical-sounding.

You have tools for:
- Web search (competitor research, scientific literature, market data)
- Peptide research (mechanism, dosages, legal status, competitors)
- Content writing (product pages, emails, ads)
- Price calculation (cost/margin modelling)

Use the right tool for each query. Be honest when a tool isn't wired — don't fabricate data.
Prioritise accuracy. Flag legal uncertainties clearly.`,
  model: 'gpt-4o',
  tools: [searchTool, researchPeptideTool, writeContentTool, calculatePriceTool],
})

// ─── Run helper ────────────────────────────────────────────────────────────────

export async function runAgent(input: string) {
  ensureProvider()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return run(genepicAgent, input) as any
}
