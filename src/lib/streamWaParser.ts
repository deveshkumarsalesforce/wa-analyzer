/**
 * Streaming WA log parser for large files (GBs).
 * Reads file in chunks, parses line-by-line, accumulates rows (capped) and reports progress.
 */
import { parseWALogLine } from './waParser'
import type { WALogRow } from '../types/wa'

const YIELD_EVERY_LINES = 25000
const MAX_ROWS = 1_000_000

export interface StreamWAProgress {
  bytesRead: number
  fileSize: number
  linesParsed: number
  phase: 'reading' | 'parsing' | 'done'
}

export interface StreamWAResult {
  rows: WALogRow[]
  errors: string[]
  truncated: boolean
}

export async function streamWALogFile(
  file: File,
  onProgress: (p: StreamWAProgress) => void,
  signal?: AbortSignal | null
): Promise<StreamWAResult> {
  const errors: string[] = []
  const rows: WALogRow[] = []
  const fileSize = file.size
  let bytesRead = 0
  let linesParsed = 0
  let buffer = ''

  const stream = file.stream()
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: false })

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (signal?.aborted) {
        errors.push('Analysis cancelled.')
        break
      }
      bytesRead += value.length
      buffer += decoder.decode(value, { stream: true })
      onProgress({ bytesRead, fileSize, linesParsed, phase: 'reading' })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? ''
        const t = line.trim()
        if (!t || t.startsWith('Opening')) continue
        const row = parseWALogLine(line)
        if (row) {
          rows.push(row)
          linesParsed += 1
          if (rows.length >= MAX_ROWS) break
        }
        if (linesParsed > 0 && linesParsed % YIELD_EVERY_LINES === 0) {
          onProgress({ bytesRead, fileSize, linesParsed, phase: 'parsing' })
          await new Promise<void>((r) => setTimeout(r, 0))
          if (signal?.aborted) break
        }
      }
      if (rows.length >= MAX_ROWS) break
    }

    if (buffer.trim()) {
      const row = parseWALogLine(buffer)
      if (row && rows.length < MAX_ROWS) {
        rows.push(row)
        linesParsed += 1
      }
    }

    const truncated = rows.length >= MAX_ROWS
    if (truncated) {
      errors.push(`File is very large. Showing first ${MAX_ROWS.toLocaleString()} rows. Use a smaller file or split the log for full analysis.`)
    }
    if (rows.length === 0 && errors.length === 0) {
      errors.push('No valid WA log entries found. Expect pipe-delimited format.')
    }

    onProgress({ bytesRead, fileSize, linesParsed, phase: 'done' })
    return { rows, errors, truncated }
  } finally {
    reader.releaseLock()
  }
}

export function formatBytes(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' GB'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' MB'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + ' KB'
  return n + ' B'
}

export function formatProgress(p: StreamWAProgress): string {
  const size = formatBytes(p.fileSize)
  const read = formatBytes(p.bytesRead)
  if (p.phase === 'done') {
    return `Done — ${p.linesParsed.toLocaleString()} lines parsed from ${size}`
  }
  const phaseLabel = p.phase === 'parsing' ? 'Parsing' : 'Reading'
  return `${phaseLabel} ${read} / ${size} — ${p.linesParsed.toLocaleString()} lines`
}
