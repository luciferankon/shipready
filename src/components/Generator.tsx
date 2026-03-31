'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MODES, type Mode } from '@/lib/types'
import { EXAMPLES } from '@/lib/examples'

// ── Section parser ───────────────────────────────────────────────────────────
const PR_KEYS = ['TITLE', 'SUMMARY', 'CHANGES', 'TESTING', 'NOTES']
const COMMIT_KEYS = ['FORMAT', 'BODY', 'FOOTER']
const RELEASE_KEYS = ['VERSION HIGHLIGHTS', "WHAT'S NEW", 'IMPROVEMENTS', 'BREAKING CHANGES']

function parseOutput(text: string, mode: Mode): Record<string, string> | null {
  const keys = mode === 'pr' ? PR_KEYS : mode === 'commit' ? COMMIT_KEYS : RELEASE_KEYS
  const result: Record<string, string> = {}
  let matched = false

  keys.forEach((key, i) => {
    const nextKey = keys[i + 1]
    const pat = nextKey
      ? new RegExp(`${key}:\\s*([\\s\\S]*?)(?=${nextKey}:|$)`, 'i')
      : new RegExp(`${key}:\\s*([\\s\\S]*)`, 'i')
    const m = text.match(pat)
    if (m?.[1]?.trim()) {
      result[key] = m[1].trim()
      matched = true
    }
  })

  return matched ? result : null
}

// ── Output block colors ──────────────────────────────────────────────────────
const BLOCK_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  TITLE:              { label: '📋 Title',              bg: 'bg-[rgba(245,200,66,0.06)]',   text: 'text-gold',   border: 'border-[rgba(245,200,66,0.2)]' },
  SUMMARY:            { label: '📝 Summary',            bg: 'bg-[rgba(79,143,255,0.06)]',   text: 'text-blue',   border: 'border-[rgba(79,143,255,0.2)]'  },
  CHANGES:            { label: '🔧 Changes',            bg: 'bg-[rgba(62,207,142,0.06)]',   text: 'text-green',  border: 'border-[rgba(62,207,142,0.2)]'  },
  TESTING:            { label: '✅ Testing',            bg: 'bg-[rgba(62,207,142,0.06)]',   text: 'text-green',  border: 'border-[rgba(62,207,142,0.2)]'  },
  NOTES:              { label: '⚠️ Notes',              bg: 'bg-[rgba(255,79,79,0.06)]',    text: 'text-red',    border: 'border-[rgba(255,79,79,0.2)]'   },
  FORMAT:             { label: '✍️ Commit',             bg: 'bg-[rgba(245,200,66,0.06)]',   text: 'text-gold',   border: 'border-[rgba(245,200,66,0.2)]'  },
  BODY:               { label: '📝 Body',               bg: 'bg-[rgba(79,143,255,0.06)]',   text: 'text-blue',   border: 'border-[rgba(79,143,255,0.2)]'  },
  FOOTER:             { label: '🔗 Footer',             bg: 'bg-[rgba(107,107,136,0.1)]',   text: 'text-muted',  border: 'border-border'                  },
  'VERSION HIGHLIGHTS':{ label: '🚀 Highlights',       bg: 'bg-[rgba(245,200,66,0.06)]',   text: 'text-gold',   border: 'border-[rgba(245,200,66,0.2)]'  },
  "WHAT'S NEW":       { label: "✨ What's New",        bg: 'bg-[rgba(62,207,142,0.06)]',   text: 'text-green',  border: 'border-[rgba(62,207,142,0.2)]'  },
  IMPROVEMENTS:       { label: '📈 Improvements',      bg: 'bg-[rgba(79,143,255,0.06)]',   text: 'text-blue',   border: 'border-[rgba(79,143,255,0.2)]'  },
  'BREAKING CHANGES': { label: '💥 Breaking Changes',  bg: 'bg-[rgba(255,79,79,0.06)]',    text: 'text-red',    border: 'border-[rgba(255,79,79,0.2)]'   },
}

export function Generator() {
  const [mode, setMode] = useState<Mode>('pr')
  const [input, setInput] = useState('')
  const [rawOutput, setRawOutput] = useState('')
  const [parsedOutput, setParsedOutput] = useState<Record<string, string> | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll output while streaming
  useEffect(() => {
    if (isStreaming && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [rawOutput, isStreaming])

  const reset = useCallback(() => {
    setRawOutput('')
    setParsedOutput(null)
    setIsDone(false)
    setError('')
  }, [])

  const switchMode = useCallback((m: Mode) => {
    setMode(m)
    reset()
  }, [reset])

  const generate = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsStreaming(true)
    setParsedOutput(null)
    setIsDone(false)
    setError('')
    setRawOutput('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setRawOutput(accumulated)
      }

      // Parse after stream completes
      const parsed = parseOutput(accumulated, mode)
      setParsedOutput(parsed)
      setIsDone(true)
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [mode, input, isStreaming])

  const copyOutput = async () => {
    if (!rawOutput) return
    await navigator.clipboard.writeText(rawOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasOutput = rawOutput.length > 0 || isStreaming

  return (
    <section className="max-w-[1200px] mx-auto px-6 pb-8">
      {/* Mode tabs */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
              mode === m.id
                ? 'border-gold bg-[rgba(245,200,66,0.08)] text-gold'
                : 'border-border bg-surface text-muted hover:border-muted2 hover:text-fore',
            ].join(' ')}
          >
            <span className="text-lg">{m.icon}</span>
            <div>
              <div className="text-sm font-semibold leading-tight">{m.label}</div>
              <div className="text-xs opacity-60 leading-tight mt-0.5">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Two-panel */}
      <div className="grid grid-cols-2 gap-0 bg-surface border border-border rounded-2xl overflow-hidden">

        {/* ── LEFT: Input ── */}
        <div className="flex flex-col border-r border-border">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Input
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted mr-1">Examples:</span>
              {Object.keys(EXAMPLES).map((key) => (
                <button
                  key={key}
                  onClick={() => setInput(EXAMPLES[key])}
                  className="px-2 py-1 text-[11px] font-mono text-muted bg-surface2 border border-border rounded hover:text-gold hover:border-[rgba(245,200,66,0.4)] transition-all"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate()
            }}
            placeholder={`Paste your git diff here...\n\ndiff --git a/src/auth/middleware.ts b/src/auth/middleware.ts\n--- a/src/auth/middleware.ts\n+++ b/src/auth/middleware.ts\n@@ -12,6 +12,18 @@ export async function auth(req, res, next) {\n+  if (isExpired(token)) return unauthorized()\n+  req.user = decode(token)`}
            className="flex-1 min-h-[340px] p-5 bg-transparent text-fore font-mono text-sm resize-none outline-none placeholder-muted2 leading-relaxed"
          />

          {/* Generate bar */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <button
              onClick={generate}
              disabled={isStreaming || !input.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black font-bold text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_4px_24px_rgba(245,200,66,0.3)] hover:-translate-y-px transition-all active:translate-y-0"
            >
              {isStreaming ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                '⚡ Generate'
              )}
            </button>
            <span className="text-[11px] text-muted font-mono">⌘ + Enter</span>
          </div>
        </div>

        {/* ── RIGHT: Output ── */}
        <div className="flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
              {MODES.find((m) => m.id === mode)?.outputLabel ?? 'Output'}
            </span>
            <div className="flex gap-2">
              {hasOutput && (
                <button
                  onClick={reset}
                  className="px-3 py-1 text-[11px] text-muted border border-border rounded hover:text-fore hover:border-muted2 transition-all"
                >
                  Clear
                </button>
              )}
              <button
                onClick={copyOutput}
                disabled={!rawOutput}
                className={[
                  'px-3 py-1 text-[11px] border rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                  copied
                    ? 'text-green border-[rgba(62,207,142,0.5)] bg-[rgba(62,207,142,0.08)]'
                    : 'text-muted border-border hover:text-fore hover:border-muted2',
                ].join(' ')}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Output content */}
          <div
            ref={outputRef}
            className="flex-1 min-h-[340px] overflow-y-auto"
          >
            {error ? (
              <div className="m-5 p-4 bg-[rgba(255,79,79,0.08)] border border-[rgba(255,79,79,0.25)] rounded-xl text-red text-sm font-mono leading-relaxed">
                ⚠️ {error}
              </div>
            ) : isStreaming && !rawOutput ? (
              /* Loading dots */
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gold rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
                <p className="text-muted text-sm">Generating…</p>
              </div>
            ) : isDone && parsedOutput ? (
              /* Parsed sections */
              <div className="p-5 space-y-3">
                {Object.entries(parsedOutput).map(([key, value]) => {
                  const colors = BLOCK_COLORS[key]
                  if (!colors) return null
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border overflow-hidden ${colors.border}`}
                    >
                      <div
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${colors.bg} ${colors.text}`}
                      >
                        {colors.label}
                      </div>
                      <div className="px-4 py-3 font-mono text-sm text-fore whitespace-pre-wrap leading-relaxed bg-surface2/50">
                        {value}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : rawOutput ? (
              /* Streaming raw text */
              <div className="p-5">
                <pre className="font-mono text-sm text-fore whitespace-pre-wrap leading-relaxed">
                  {rawOutput}
                  {isStreaming && (
                    <span className="animate-[blink_1s_step-end_infinite] text-gold">▋</span>
                  )}
                </pre>
              </div>
            ) : (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted2">
                <span className="text-5xl">⚡</span>
                <p className="text-sm">Paste your diff and hit Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
