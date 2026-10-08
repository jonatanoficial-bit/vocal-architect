const pitchClasses = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

export function midiToSpelling(midi: number) {
  const roundedMidi = Math.round(midi)
  const pitchClass = ((roundedMidi % 12) + 12) % 12
  const octave = Math.floor(roundedMidi / 12) - 1
  return `${pitchClasses[pitchClass]}${octave}`
}

export function clampMidi(midi: number) {
  return Math.max(0, Math.min(127, Math.round(midi)))
}
