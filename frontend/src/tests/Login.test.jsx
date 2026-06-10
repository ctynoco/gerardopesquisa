import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
    expect(screen.getByPlaceholderText('Telefone')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('deve chamar login com telefone e senha', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Telefone'), '(85) 996962828')
    await user.type(screen.getByPlaceholderText('Senha'), '123456')
    await user.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('(85) 996962828', '123456')
    })
  })

  it('deve exibir erro quando login falhar', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'))

    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Telefone'), '(85) 000000000')
    await user.type(screen.getByPlaceholderText('Senha'), 'errada')
    await user.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })
})
