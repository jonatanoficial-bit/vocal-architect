import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import App from '../src/App'

describe('Vocal Architect foundation', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    window.location.hash = ''
  })

  it('renders the project dashboard without claiming unavailable features', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /o seu estúdio para projetar vozes/i })).toBeInTheDocument()
    expect(screen.getByText(/continuam indisponíveis/i)).toBeInTheDocument()
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
  })
})
