'use client'

import { useCompletion } from '@ai-sdk/react'
import { useRef, useEffect } from 'react'

export default function ChatPage() {
  const { completion, input, handleInputChange, handleSubmit, isLoading, complete, error } =
    useCompletion({
      api: '/api/agent',
    })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [completion])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0A0E14',
        color: '#E8F0F8',
        fontFamily: "'Sora', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid #1A2744',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #57C7DA, #2C788A)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Genepic Assistant</div>
          <div style={{ fontSize: 11, color: '#6B7A8D' }}>
            OpenAI Agents SDK + Responses API
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              padding: '3px 8px',
              background: '#1A2744',
              borderRadius: 20,
              color: '#00BFB3',
            }}
          >
            GPT-4o
          </span>
          <span
            style={{
              fontSize: 10,
              padding: '3px 8px',
              background: '#1A2744',
              borderRadius: 20,
              color: '#6B7A8D',
            }}
          >
            Streaming
          </span>
        </div>
      </header>

      {/* Completion output */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {completion === '' && !isLoading && (
          <div style={{ textAlign: 'center', color: '#6B7A8D', marginTop: 80, fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧬</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Genepic Assistant</div>
            <div>Ask me about peptides, pricing, content, or market research.</div>
          </div>
        )}

        {completion && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00BFB3, #2C788A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              G
            </div>
            <div
              style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: 16,
                background: '#1A2744',
                border: '1px solid #2A3A5A',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#E8F0F8',
                whiteSpace: 'pre-wrap',
              }}
            >
              {completion}
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00BFB3, #2C788A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              G
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 16,
                background: '#1A2744',
                border: '1px solid #2A3A5A',
                fontSize: 14,
                color: '#6B7A8D',
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: '#2A1A1A',
              border: '1px solid #5A2A2A',
              color: '#FF6B6B',
              fontSize: 13,
            }}
          >
            Error: {error.message}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '16px 32px 24px',
          borderTop: '1px solid #1A2744',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim() && !isLoading) {
              complete(input)
            }
          }}
          style={{ display: 'flex', gap: 12, maxWidth: 800, margin: '0 auto' }}
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about peptides, pricing, research..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: '#1A2744',
              border: '1px solid #2A3A5A',
              color: '#E8F0F8',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              background:
                isLoading
                  ? '#1A2744'
                  : 'linear-gradient(135deg, #00BFB3, #2C788A)',
              border: 'none',
              color: isLoading ? '#6B7A8D' : '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.2s',
            }}
          >
            Send
          </button>
        </form>
        <div
          style={{
            textAlign: 'center',
            marginTop: 10,
            fontSize: 11,
            color: '#3A4A5A',
          }}
        >
          Powered by OpenAI Responses API + Agents SDK · Deployed on Vercel
        </div>
      </div>
    </div>
  )
}
