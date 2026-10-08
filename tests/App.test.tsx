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

  it('renders an honest description of the current lot', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /um lugar sério para construir harmonia vocal/i })).toBeInTheDocument()
    expect(screen.getByText(/ainda não estão disponíveis/i)).toBeInTheDocument()
  })

  it('navigates to the architecture page through the hash router', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Arquitetura' })).toHaveAttribute('href', '#/arquitetura')
    window.location.hash = '#/arquitetura'
    fireEvent(window, new HashChangeEvent('hashchange'))
    expect(screen.getByRole('heading', { name: /uma base que não confunde tela com motor musical/i })).toBeInTheDocument()
  })
})
