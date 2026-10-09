import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'

describe('Vocal Architect foundation', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    window.location.hash = ''
  })

  it('renders the project dashboard with the available harmony analysis scope', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /o seu estúdio para projetar vozes/i })).toBeInTheDocument()
    expect(screen.getByText(/audição local dessas vozes em piano funcionam/i)).toBeInTheDocument()
  })

  it('navigates to the architecture page through the hash router', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Arquitetura' })).toHaveAttribute('href', '#/arquitetura')
    window.location.hash = '#/arquitetura'
    fireEvent(window, new HashChangeEvent('hashchange'))
    expect(screen.getByRole('heading', { name: /uma base que não confunde tela com motor musical/i })).toBeInTheDocument()
  })

  it('creates an in-memory session before opening the studio', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /criar sessão de projeto/i }))
    fireEvent(window, new HashChangeEvent('hashchange'))

    expect(screen.getByRole('textbox', { name: /nome do projeto/i })).toHaveValue('Novo projeto')
    expect(screen.getByText(/sem salvamento local nesta versão/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/escolher arquivo de áudio/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /transcrição monofônica/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reconhecer notas/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /áudio/i })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /melodia/i }))
    expect(screen.getByRole('heading', { name: /editor de melodia/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /harmonia/i }))
    expect(screen.getByRole('heading', { name: /harmonia começa com uma melodia confirmada/i })).toBeInTheDocument()
  })

  it('does not request the microphone until the user starts a recording', async () => {
    const microphoneRequest = vi.fn().mockRejectedValue({ name: 'NotAllowedError' })
    const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
    const originalMediaRecorder = Object.getOwnPropertyDescriptor(globalThis, 'MediaRecorder')
    const originalSecureContext = Object.getOwnPropertyDescriptor(window, 'isSecureContext')

    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: microphoneRequest } })
    Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: class MediaRecorderMock {} })
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })

    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /criar sessão de projeto/i }))
      fireEvent(window, new HashChangeEvent('hashchange'))
      expect(microphoneRequest).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }))
      await waitFor(() => expect(microphoneRequest).toHaveBeenCalledTimes(1))
      expect(await screen.findByRole('alert')).toHaveTextContent(/acesso ao microfone foi negado/i)
    } finally {
      if (originalMediaDevices) Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices)
      else Reflect.deleteProperty(navigator, 'mediaDevices')
      if (originalMediaRecorder) Object.defineProperty(globalThis, 'MediaRecorder', originalMediaRecorder)
      else Reflect.deleteProperty(globalThis, 'MediaRecorder')
      if (originalSecureContext) Object.defineProperty(window, 'isSecureContext', originalSecureContext)
      else Reflect.deleteProperty(window, 'isSecureContext')
    }
  })
})
