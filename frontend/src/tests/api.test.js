import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../services/api'

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('deve ter baseURL configurada', () => {
    expect(api.defaults.baseURL).toBeDefined()
  })

  it('deve injetar token nos headers se existir no localStorage', () => {
    localStorage.setItem('token', 'test-token-123')
    const reqInterceptor = api.interceptors.request.handlers[0]
    const config = reqInterceptor.fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer test-token-123')
  })

  it('não deve injetar token se não existir no localStorage', () => {
    const reqInterceptor = api.interceptors.request.handlers[0]
    const config = reqInterceptor.fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('deve redirecionar para /login em erro 401', () => {
    const originalHref = window.location.href
    delete window.location
    window.location = { href: '' }

    const resInterceptor = api.interceptors.response.handlers[0]
    const err = { response: { status: 401 } }
    resInterceptor.rejected(err).catch(() => {})

    expect(window.location.href).toBe('/login')

    window.location = { href: originalHref }
  })

  it('não deve redirecionar para erros não-401', () => {
    const originalHref = window.location.href
    delete window.location
    window.location = { href: '' }

    const resInterceptor = api.interceptors.response.handlers[0]
    const err = { response: { status: 500 } }
    resInterceptor.rejected(err).catch(() => {})

    expect(window.location.href).toBe('')

    window.location = { href: originalHref }
  })
})
