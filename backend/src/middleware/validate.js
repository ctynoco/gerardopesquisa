const { z } = require('zod')

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  telefone: z.string().min(8, 'Telefone inválido').max(20),
  senha: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres').max(100),
  perfil: z.enum(['admin', 'entrevistador']).optional(),
})

const loginSchema = z.object({
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

const pesquisaSchema = z.object({
  titulo: z.string().min(2, 'Título deve ter no mínimo 2 caracteres').max(255),
  descricao: z.string().optional().nullable(),
  margem_erro: z.number().min(0).max(100).optional().nullable(),
  nivel_confianca: z.number().min(0).max(100).optional().nullable(),
  tamanho_amostra: z.number().int().positive().optional().nullable(),
  populacao_alvo: z.number().int().positive().optional().nullable(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
})

const perguntaSchema = z.object({
  pesquisa_id: z.number().int().positive(),
  tipo: z.enum(['unica_escolha', 'multipla_escolha', 'sim_nao', 'escala_avaliacao', 'escala_likert', 'nota_0_10', 'ranking', 'matriz', 'texto_curto', 'texto_longo', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral', 'geolocalizacao', 'comentario_aberto', 'texto', 'aberta', 'data', 'likert', 'numerica']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional().nullable(),
  opcoes: z.array(z.string()).optional().nullable(),
  ordenacao: z.number().int().min(0).optional(),
  obrigatoria: z.boolean().optional(),
})

const entrevistadoSchema = z.object({
  pesquisa_id: z.number().int().positive(),
  nome: z.string().optional().nullable(),
  idade: z.number().int().min(0).max(150).optional().nullable(),
  genero: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  bairro: z.string().optional().nullable(),
  escolaridade: z.string().optional().nullable(),
  renda_familiar: z.string().optional().nullable(),
  ocupacao: z.string().optional().nullable(),
  zona_eleitoral: z.string().optional().nullable(),
  sessao_eleitoral: z.string().optional().nullable(),
  consentimento_lgpd: z.boolean().optional(),
})

const respostaSchema = z.object({
  pesquisa_id: z.number().int().positive(),
  pergunta_id: z.number().int().positive(),
  entrevistado_id: z.number().int().positive(),
  resposta: z.any(),
})

const usuarioSchema = z.object({
  nome: z.string().min(2).max(255),
  telefone: z.string().min(8).max(20),
  senha: z.string().min(4).max(100),
  perfil: z.enum(['admin', 'entrevistador']).optional(),
})

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      return res.status(400).json({ error: 'Dados inválidos', details: errors })
    }
    req.body = result.data
    next()
  }
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  pesquisaSchema,
  perguntaSchema,
  entrevistadoSchema,
  respostaSchema,
  usuarioSchema,
}
