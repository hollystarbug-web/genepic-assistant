/**
 * POST /api/agent
 * Works with useCompletion from @ai-sdk/react
 */

import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/agents/index'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // useCompletion sends: { prompt: "..." }
    // useChat sends: { messages: [{ role: "user", content: "..." }] }
    let userMessage = ''

    if (body.prompt) {
      userMessage = body.prompt
    } else if (body.messages && Array.isArray(body.messages)) {
      const last = body.messages[body.messages.length - 1]
      userMessage = typeof last === 'string' ? last : last?.content ?? ''
    }

    if (!userMessage) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    // Run agent with streaming
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await runAgent(userMessage)) as any

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const eventStream = result.toStream() as ReadableStream<{
          type: string
          item?: { type?: string; text?: string; name?: string; output?: string }
          data?: { type?: string; text?: string }
        }>

        const reader = eventStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const event = value

            if (event.type === 'run_item_stream_event') {
              const item = event.item
              if (!item) continue

              const itemType = item.type ?? ''

              if (itemType === 'text_message_output_item' || itemType === 'message_output_item') {
                const text = item.text ?? ''
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
                  )
                }
              }

              if (itemType === 'tool_call_item') {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'tool_call', name: item.name ?? 'unknown' })}\n\n`)
                )
              }

              if (itemType === 'tool_call_output_item') {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'tool_result', output: item.output ?? '' })}\n\n`)
                )
              }
            }

            if (event.type === 'raw_model_stream_event') {
              const data = event.data
              if (data?.type === 'response.output_text.delta' || data?.type === 'text') {
                const delta = data.text ?? ''
                if (delta) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta })}\n\n`)
                  )
                }
              }
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n\n`)
          )
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
