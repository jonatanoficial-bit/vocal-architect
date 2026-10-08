export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function normalizeRecordingName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, ' ')
  return normalized.length > 0 ? normalized.slice(0, 80) : 'Gravação vocal'
}
