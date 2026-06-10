import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '../services/api'

function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="usuario">{auth.usuario ? auth.usuario.nome : 'null'}</span>
      <span data-testid="loading">{auth.loading ? 'loading' : 'loaded'}</span>
      <button data-testid="login-btn" onClick={() => auth.login('teste@teste.com', '123456')}>Login</button>
      <button data-testid="logout-btn" onClick={auth.logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('deve iniciar sem usuário se não houver token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
      expect(screen.getByTestId('usuario').textContent).toBe('null')
    })
  })

  it('deve carregar usuário do localStorage se token existir', async () => {
    localStorage.setItem('token', 'valid-token')
    const usuarioMock = { id: 1, nome: 'João', email: 'joao@teste.com', perfil: 'admin' }
    api.get.mockResolvedValueOnce({ data: { usuario: usuarioMock } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('usuario').textContent).toBe('João')
    })
  })

  it('deve limpar dados se token for inválido', async () => {
    localStorage.setItem('token', 'invalid-token')
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Antigo' }))
    api.get.mockRejectedValueOnce(new Error('Token inválido'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('usuario').textContent).toBe('null')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('usuario')).toBeNull()
    })
  })

  it('deve fazer login com sucesso', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'new-token', usuario: { id: 2, nome: 'Maria', email: 'maria@teste.com', perfil: 'entrevistador' } },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })

    const loginBtn = screen.getByTestId('login-btn')
    loginBtn.click()

    await waitFor(() => {
      expect(screen.getByTestId('usuario').textContent).toBe('Maria')
      expect(localStorage.getItem('token')).toBe('new-token')
    })
  })
})
