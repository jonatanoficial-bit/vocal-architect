import { arrangementEndTick, normalizePlaybackRange, playbackEventsFrom, playbackPositionInRange, playbackPositionTick, secondsToTicks, ticksToSeconds } from '../../src/audio/playback/timing'
import type { VocalPart } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function parts(): VocalPart[] {
  return [
    { comfortableMaximumMidi: 76, comfortableMinimumMidi: 62, id: 'soprano', name: 'Soprano', notes: [{ durationTicks: 960, id: 's1', locked: false, origin: 'generated', pitchMidi: 72, spelling: 'C5', startTick: 0, velocity: 90, voiceId: 'soprano' }, { durationTicks: 480, id: 's2', locked: false, origin: 'generated', pitchMidi: 74, spelling: 'D5', startTick: 960, velocity: 90, voiceId: 'soprano' }], rangeMaximumMidi: 81, rangeMinimumMidi: 60, role: 'Soprano' },
    { comfortableMaximumMidi: 55, comfortableMinimumMidi: 40, id: 'bass', name: 'Baixo', notes: [{ durationTicks: 1440, id: 'b1', locked: false, origin: 'generated', pitchMidi: 48, spelling: 'C3', startTick: 0, velocity: 90, voiceId: 'bass' }], rangeMaximumMidi: 60, rangeMinimumMidi: 40, role: 'Baixo' },
  ]
}

describe('playback timing', () => {
  it('converts ticks through tempo without changing the MIDI event data', () => {
    expect(ticksToSeconds(960, 120)).toBe(0.5)
    expect(secondsToTicks(0.5, 120)).toBe(960)
    expect(ticksToSeconds(960, 60)).toBe(1)
  })

  it('schedules sustained notes safely from a seek position', () => {
    const events = playbackEventsFrom(parts(), 480, 120)

    expect(events).toHaveLength(3)
    expect(events.find((event) => event.note.id === 's1')).toMatchObject({ durationSeconds: 0.25, startOffsetSeconds: 0 })
    expect(events.find((event) => event.note.id === 'b1')).toMatchObject({ durationSeconds: 0.5, startOffsetSeconds: 0 })
    expect(events.find((event) => event.note.id === 's2')?.note.pitchMidi).toBe(74)
  })

  it('reports the arrangement end and wraps only when loop is enabled', () => {
    expect(arrangementEndTick(parts())).toBe(1440)
    expect(playbackPositionTick(960, 10, 10.5, 120, 1440, false)).toBe(1440)
    expect(playbackPositionTick(960, 10, 10.5, 120, 1440, true)).toBe(480)
  })

  it('limits sustained notes and the transport position to a selected loop region', () => {
    const range = normalizePlaybackRange(480, 1200, 1440)
    const events = playbackEventsFrom(parts(), range.startTick, 120, range.endTick)

    expect(range).toEqual({ startTick: 480, endTick: 1200 })
    expect(events.find((event) => event.note.id === 'b1')).toMatchObject({ durationSeconds: 0.375, startOffsetSeconds: 0 })
    expect(playbackPositionInRange(range, 960, 10, 10.25, 120, true)).toBe(720)
    expect(playbackPositionInRange(range, 960, 10, 11, 120, false)).toBe(1200)
  })
})
