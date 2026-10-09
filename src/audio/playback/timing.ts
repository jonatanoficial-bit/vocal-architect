import type { NoteEvent, VocalPart } from '../../music/types'
import { PPQ } from '../../music/types'

export const defaultPlaybackTempoBpm = 96

export type PlaybackEvent = {
  durationSeconds: number
  note: NoteEvent
  startOffsetSeconds: number
  voiceId: string
}

export type PlaybackRange = {
  endTick: number
  startTick: number
}

export function secondsPerTick(tempoBpm: number) {
  return 60 / (Math.max(1, tempoBpm) * PPQ)
}

export function ticksToSeconds(ticks: number, tempoBpm: number) {
  return Math.max(0, ticks) * secondsPerTick(tempoBpm)
}

export function secondsToTicks(seconds: number, tempoBpm: number) {
  return Math.max(0, seconds) / secondsPerTick(tempoBpm)
}

export function arrangementEndTick(parts: VocalPart[]) {
  return Math.max(0, ...parts.flatMap((part) => part.notes.map((note) => note.startTick + note.durationTicks)))
}

export function clampPlaybackTick(tick: number, endTick: number) {
  return Math.max(0, Math.min(Math.max(0, endTick), Math.round(tick)))
}

export function normalizePlaybackRange(startTick: number, endTick: number, arrangementEnd: number): PlaybackRange {
  const safeEnd = clampPlaybackTick(endTick, arrangementEnd)
  const safeStart = clampPlaybackTick(startTick, safeEnd)
  return safeEnd > safeStart ? { endTick: safeEnd, startTick: safeStart } : { endTick: Math.max(0, arrangementEnd), startTick: 0 }
}

export function playbackEventsFrom(parts: VocalPart[], startTick: number, tempoBpm: number, stopTick = arrangementEndTick(parts)): PlaybackEvent[] {
  const safeStartTick = Math.max(0, startTick)
  const safeStopTick = Math.max(safeStartTick, stopTick)
  return parts.flatMap((part) => part.notes.flatMap((note) => {
    const endTick = note.startTick + note.durationTicks
    if (endTick <= safeStartTick || note.startTick >= safeStopTick) return []
    const audibleStartTick = Math.max(note.startTick, safeStartTick)
    const audibleEndTick = Math.min(endTick, safeStopTick)
    return [{
      durationSeconds: ticksToSeconds(audibleEndTick - audibleStartTick, tempoBpm),
      note,
      startOffsetSeconds: ticksToSeconds(audibleStartTick - safeStartTick, tempoBpm),
      voiceId: part.id,
    }]
  })).sort((first, second) => first.startOffsetSeconds - second.startOffsetSeconds || first.note.pitchMidi - second.note.pitchMidi)
}

export function playbackPositionTick(startTick: number, startTimeSeconds: number, currentTimeSeconds: number, tempoBpm: number, endTick: number, loop: boolean) {
  const elapsedTicks = secondsToTicks(Math.max(0, currentTimeSeconds - startTimeSeconds), tempoBpm)
  const position = startTick + elapsedTicks
  if (!loop || endTick === 0) return clampPlaybackTick(position, endTick)
  return position % endTick
}

export function playbackPositionInRange(range: PlaybackRange, startTick: number, startTimeSeconds: number, currentTimeSeconds: number, tempoBpm: number, loop: boolean) {
  const elapsedTicks = secondsToTicks(Math.max(0, currentTimeSeconds - startTimeSeconds), tempoBpm)
  const position = startTick + elapsedTicks
  if (!loop) return clampPlaybackTick(position, range.endTick)
  const span = range.endTick - range.startTick
  if (span <= 0) return range.startTick
  return range.startTick + ((position - range.startTick) % span + span) % span
}
