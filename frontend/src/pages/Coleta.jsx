import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, LinearProgress, Paper, Chip, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import api from '../services/api'

const PERFIL = [
  { id: 'nome', label: 'Nome', type: 'text' },
  { id: 'idade', label: 'Idade', type: 'number' },
  { id: 'genero', label: 'Sexo', type: 'select', opts: ['Masculino', 'Feminino', 'Outro', 'Prefere não informar'] },
  { id: 'escolaridade', label: 'Escolaridade', type: 'select', opts: ['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'] },
  { id: 'renda_familiar', label: 'Renda Familiar', type: 'select', opts: ['Até 1 SM', '1 a 2 SM', '2 a 5 SM', '5 a 10 SM', 'Acima de 10 SM', 'Não informa'] },
  { id: 'bairro', label: 'Bairro', type: 'text' },
  { id: 'cidade', label: 'Município', type: 'text' },
  { id: 'estado', label: 'Estado', type: 'text', maxLen: 2 },
]

export default function Coleta() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [perfil, setPerfil] = useState({})
  const [etapa, setEtapa] = useState(0)
  const [qAtual, setQAtual] = useState(0)
  const [pAtual, setPAtual] = useState(0)
  const [entrevistadoId, setEntrevistadoId] = useState(null)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  function iniciar() {
    api.get(`/perguntas?pesquisa_id=${pesquisaId}`).then((r) => {
      setPerguntas(r.data.perguntas)
      setEtapa(1)
    })
  }

  async function salvarPerfil() {
    const body = { pesquisa_id: Number(pesquisaId), ...perfil, consentimento_lgpd: true }
    const r = await api.post('/entrevistados', body)
    setEntrevistadoId(r.data.entrevistado.id)
    setEtapa(2)
  }

  async function responder(perguntaId, valor) {
    if (!entrevistadoId) return
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
    await api.post('/respostas', {
      pesquisa_id: Number(pesquisaId),
      pergunta_id: Number(perguntaId),
      entrevistado_id: Number(entrevistadoId),
      resposta: { valor },
    }).catch(() => {})
  }

  function avancar() {
    if (qAtual < perguntas.length - 1) setQAtual((q) => q + 1)
  }

  function voltar() {
    if (qAtual > 0) setQAtual((q) => q - 1)
  }

  function finalizar() {
    alert('Coleta finalizada com sucesso!')
    setEtapa(0); setPesquisaId(''); setPerguntas([]); setRespostas({}); setPerfil({})
    setQAtual(0); setPAtual(0); setEntrevistadoId(null)
  }

  const totalEtapas = PERFIL.length + perguntas.length
  const etapaAtual = etapa === 1 ? pAtual : etapa === 2 ? PERFIL.length + qAtual : 0

  if (etapa === 2 && perguntas.length > 0) {
    const p = perguntas[qAtual]
    const answered = Object.keys(respostas).length
    const progress = ((PERFIL.length + answered) / totalEtapas) * 100
    const isLast = qAtual === perguntas.length - 1

    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography variant="caption" fontWeight={600}>{PERFIL.length + answered}/{totalEtapas}</Typography>
              <Typography variant="caption" color="text.secondary">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ height: 5, borderRadius: 3 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
            Pergunta {PERFIL.length + qAtual + 1} de {totalEtapas}
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2, fontSize: '0.95rem', lineHeight: 1.4 }}>{p.titulo}</Typography>

          {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {p.opcoes?.map((o) => (
                <Button key={o} variant={respostas[p.id] === o ? 'contained' : 'outlined'} onClick={() => { responder(p.id, o); if (!isLast || p.tipo === 'unica_escolha') setTimeout(avancar, 100) }} sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.3, px: 2, borderRadius: 2, fontSize: '0.85rem' }}>
                  {o}
                </Button>
              ))}
            </Box>
          ) : (
            <TextField value={respostas[p.id] || ''} onChange={(e) => setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))} placeholder="Digite a resposta..." multiline rows={3} fullWidth sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {qAtual > 0 && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={voltar} sx={{ flex: 1, borderRadius: 2, py: 1.3 }}>Anterior</Button>}
          <Box sx={{ flex: 1 }} />
          {p.tipo === 'aberta' && (
            <Button variant="contained" endIcon={isLast ? <CheckCircleIcon /> : <ArrowForwardIcon />} onClick={() => { responder(p.id, respostas[p.id] || ''); if (!isLast) avancar() }} disabled={!respostas[p.id]?.trim()} sx={{ borderRadius: 2, py: 1.3 }}>
              {isLast ? 'Finalizar' : 'Próxima'}
            </Button>
          )}
        </Box>

        {isLast && answered >= perguntas.length && (
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={finalizar} fullWidth sx={{ mt: 2, borderRadius: 2, py: 1.5 }}>
            Finalizar Coleta
          </Button>
        )}
      </Box>
    )
  }

  if (etapa === 1) {
    const campo = PERFIL[pAtual]
    if (!campo) { setEtapa(2); return null }
    const total = PERFIL.length
    const progress = ((pAtual) / totalEtapas) * 100

    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography variant="caption" fontWeight={600}>{pAtual + 1}/{total}</Typography>
              <Typography variant="caption" color="text.secondary">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 5, borderRadius: 3 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Perfil do Entrevistado</Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2, mt: 0.5, fontSize: '0.95rem' }}>{campo.label}</Typography>

          {campo.type === 'select' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {campo.opts.map((o) => (
                <Button key={o} variant={perfil[campo.id] === o ? 'contained' : 'outlined'} onClick={() => { setPerfil((prev) => ({ ...prev, [campo.id]: o })); setTimeout(() => { if (pAtual < total - 1) setPAtual((p) => p + 1); else salvarPerfil() }, 100) }} sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.3, px: 2, borderRadius: 2, fontSize: '0.85rem' }}>
                  {o}
                </Button>
              ))}
            </Box>
          ) : (
            <TextField value={perfil[campo.id] || ''} onChange={(e) => setPerfil((prev) => ({ ...prev, [campo.id]: e.target.value }))} placeholder={campo.label} type={campo.type === 'number' ? 'number' : 'text'} fullWidth autoFocus inputProps={campo.maxLen ? { maxLength: campo.maxLen } : {}} sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {pAtual > 0 && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setPAtual((p) => p - 1)} sx={{ flex: 1, borderRadius: 2, py: 1.3 }}>Anterior</Button>}
          <Box sx={{ flex: 1 }} />
          {campo.type === 'text' && (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => { if (pAtual < total - 1) setPAtual((p) => p + 1); else salvarPerfil() }} disabled={!perfil[campo.id]?.trim()} sx={{ borderRadius: 2, py: 1.3 }}>
              {pAtual < total - 1 ? 'Próximo' : 'Iniciar Pesquisa'}
            </Button>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h1" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
        <HowToVoteIcon /> Coleta
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Selecione a pesquisa</InputLabel>
          <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
            {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" disabled={!pesquisaId} startIcon={<ArrowForwardIcon />} onClick={iniciar} fullWidth sx={{ py: 1.5, borderRadius: 2 }}>
          Iniciar Coleta
        </Button>
      </Paper>
    </Box>
  )
}
