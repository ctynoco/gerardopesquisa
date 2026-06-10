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

vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
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

  it('deve renderizar formulário de login por padrão', () => {
    renderLogin()
    expect(screen.getByText('Pesquisa Eleitoral')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Telefone')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument()
  })

  it('deve chamar login com telefone e senha', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Telefone'), '(85) 996962828')
    await user.type(screen.getByPlaceholderText('Senha'), '0102')
    await user.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('(85) 996962828', '0102')
    })
  })

  it('deve alternar para cadastro ao clicar em Cadastre-se', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.click(screen.getByText('Cadastre-se'))

    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument()
    expect(screen.getByText('Cadastrar')).toBeInTheDocument()
    expect(screen.getByText('Faça login')).toBeInTheDocument()
  })

  it('deve alternar de volta para login ao clicar em Faça login', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.click(screen.getByText('Cadastre-se'))
    await user.click(screen.getByText('Faça login'))

    expect(screen.getByPlaceholderText('Telefone')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })
})
