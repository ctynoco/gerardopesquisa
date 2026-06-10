import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'

const mockLogin = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

describe('Login Page', () => {
  beforeEach(() => {
    mockLogin.mockReset()
  })

  function renderLogin() {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('deve renderizar o formulário de login', () => {
    renderLogin()
    expect(screen.getByText('Pesquisa Eleitoral')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('deve chamar login com email e senha', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Email'), 'admin@teste.com')
    await user.type(screen.getByPlaceholderText('Senha'), '123456')
    await user.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@teste.com', '123456')
    })
  })

  it('deve exibir erro quando login falhar', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'))

    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Email'), 'erro@teste.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'errada')
    await user.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })
})
