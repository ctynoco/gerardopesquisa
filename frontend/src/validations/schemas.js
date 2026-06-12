import { z } from 'zod'

export const questionarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  municipio: z.string().optional(),
  data: z.string().optional(),
  amostra: z.string().optional(),
})

export const perguntaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  opcoes: z.union([z.array(z.string()), z.string()]).optional().nullable(),
})

export const pesquisaSchema = z.object({
  titulo: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional().nullable(),
  margem_erro: z.number().min(0).max(100).optional().nullable(),
  nivel_confianca: z.number().min(0).max(100).optional().nullable(),
  tamanho_amostra: z.number().int().positive().optional().nullable(),
  populacao_alvo: z.number().int().positive().optional().nullable(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
})

export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}