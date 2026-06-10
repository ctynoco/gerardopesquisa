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

  it('deve renderizar formulário de login', () => {
    renderLogin()
    expect(screen.getByText('Pesquisa Eleitoral')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Telefone')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    const botoes = screen.getAllByText('Entrar')
    expect(botoes.length).toBe(2)
  })

  it('deve chamar login com telefone e senha', async () => {
    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Telefone'), '(85) 996962828')
    await user.type(screen.getByPlaceholderText('Senha'), '0102')
    await user.click(screen.getAllByText('Entrar')[1])

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('(85) 996962828', '0102')
    })
  })

  it('deve alternar para aba de cadastro', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.click(screen.getAllByText('Cadastrar')[0])

    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument()
    const botoes = screen.getAllByText('Cadastrar')
    expect(botoes.length).toBe(2)
  })
})
