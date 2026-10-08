const maximumFileBytes = 50 * 1024 * 1024
const supportedExtensions = new Set(['aac', 'flac', 'm4a', 'mp3', 'ogg', 'opus', 'wav', 'webm'])

export const audioFileAccept = 'audio/*,.aac,.flac,.m4a,.mp3,.ogg,.opus,.wav,.webm'

function fileExtension(name: string) {
  const extension = name.split('.').pop()
  return extension?.toLowerCase() ?? ''
}

export function validateAudioBlob(blob: Blob, name: string): string | null {
  if (blob.size === 0) return 'O arquivo está vazio. Selecione um áudio com conteúdo para analisar.'
  if (blob.size > maximumFileBytes) return 'O arquivo excede o limite de 50 MB para processamento local nesta versão.'

  const extension = fileExtension(name)
  const hasAudioMimeType = blob.type.startsWith('audio/')
  if (!hasAudioMimeType && !supportedExtensions.has(extension)) {
    return 'Selecione um arquivo de áudio compatível com o navegador. Não é possível aceitar este formato com segurança.'
  }

  return null
}

export function validateAudioFile(file: File): string | null {
  return validateAudioBlob(file, file.name)
}

export function validateDecodedAudio({ durationMs, decodedBytes }: { decodedBytes: number; durationMs: number }): string | null {
  if (durationMs <= 0) return 'O áudio decodificado não possui duração válida.'
  if (durationMs > 10 * 60 * 1000) return 'O áudio ultrapassa o limite de 10 minutos para análise local nesta versão.'
  if (decodedBytes > 96 * 1024 * 1024) return 'O áudio decodificado excede o limite de memória segura desta versão.'
  return null
}
