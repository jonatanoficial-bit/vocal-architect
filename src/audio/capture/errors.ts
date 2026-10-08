export function microphoneErrorMessage(error: unknown): string {
  const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : ''

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'O acesso ao microfone foi negado. Autorize-o nas configurações do navegador e tente novamente.'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Nenhum microfone disponível foi encontrado. Conecte ou selecione um dispositivo de entrada e tente novamente.'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'O microfone está em uso por outro aplicativo ou não pôde ser iniciado. Feche outros aplicativos de áudio e tente novamente.'
    case 'AbortError':
      return 'A captura foi interrompida antes de começar. Tente gravar novamente.'
    case 'OverconstrainedError':
      return 'As configurações de áudio não são compatíveis com o microfone selecionado. Escolha outro dispositivo e tente novamente.'
    default:
      return 'Não foi possível iniciar a gravação. Verifique o microfone e tente novamente.'
  }
}
