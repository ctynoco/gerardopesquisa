import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, LinearProgress, Paper, Chip } from '@mui/material'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import SaveIcon from '@mui/icons-material/Save'
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
  const [observacoes, setObservacoes] = useState('')
  const [concluido, setConcluido] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  const now = new Date()
  const dataStr = now.toLocaleDateString('pt-BR')
  const horaStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  function iniciar() {
    api.get(`/perguntas?pesquisa_id=${pesquisaId}`).then((r) => {
      setPerguntas(r.data.perguntas || [])
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
      observacoes: observacoes || null,
    }).catch(() => {})
  }

  function resetar() {
    setEtapa(0); setPesquisaId(''); setPerguntas([]); setRespostas({}); setPerfil({})
    setQAtual(0); setPAtual(0); setEntrevistadoId(null); setObservacoes(''); setConcluido(false)
  }

  async function salvarTudo() {
    setSalvando(true)
    for (const [pid, valor] of Object.entries(respostas)) {
      await api.post('/respostas', {
        pesquisa_id: Number(pesquisaId),
        pergunta_id: Number(pid),
        entrevistado_id: Number(entrevistadoId),
        resposta: { valor },
      }).catch(() => {})
    }
    setSalvando(false)
    setConcluido(true)
  }

  const totalSteps = PERFIL.length + perguntas.length
  const currentStep = etapa === 1 ? pAtual : etapa === 2 ? PERFIL.length + qAtual : 0
  const progressPct = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0
  const qtdRespondidas = Object.keys(respostas).length

  // Tela final — ENTREVISTA ENCERRADA
  if (etapa === 3) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: '2px solid', borderColor: 'success.main', borderRadius: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontSize: '1.4rem' }}>ENTREVISTA ENCERRADA</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            A presente entrevista foi concluída e validada pelo sistema.
          </Typography>
          <Box sx={{ textAlign: 'left', backgroundColor: 'action.hover', p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Nº:</strong> {entrevistadoId}</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Entrevistado:</strong> {perfil.nome}</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Data:</strong> {dataStr}</Typography>
            <Typography variant="caption" display="block"><strong>Hora:</strong> {horaStr}</Typography>
          </Box>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={resetar} sx={{ borderRadius: 2, py: 1.3, px: 4 }}>
            Nova Entrevista
          </Button>
        </Paper>
      </Box>
    )
  }

  // Etapa 2 — Perguntas
  if (etapa === 2 && perguntas.length > 0) {
    const p = perguntas[qAtual]
    const isLast = qAtual === perguntas.length - 1
    const jaRespondeu = !!respostas[p?.id]
    const todasRespondidas = qtdRespondidas >= perguntas.length

    // Se concluiu (clicou Salvar Pesquisa)
    if (concluido) {
      return (
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: '2px solid', borderColor: 'success.main', borderRadius: 3, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontSize: '1.4rem' }}>Questionário Concluído</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              A presente entrevista foi concluída e validada pelo sistema.
            </Typography>
            <Box sx={{ textAlign: 'left', backgroundColor: 'action.hover', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Nº:</strong> {entrevistadoId}</Typography>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Entrevistado:</strong> {perfil.nome}</Typography>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Data:</strong> {dataStr}</Typography>
              <Typography variant="caption" display="block"><strong>Hora:</strong> {horaStr}</Typography>
            </Box>
            <Button variant="contained" color="success" size="large" onClick={() => setEtapa(3)} sx={{ borderRadius: 2, py: 1.5, px: 5, fontSize: '1rem' }}>
              FIM DA PESQUISA
            </Button>
          </Paper>
        </Box>
      )
    }

    return (
      <Box sx={{ maxWidth: 520, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'action.hover' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
            <Typography variant="caption"><strong>Nº:</strong> {entrevistadoId}</Typography>
            <Typography variant="caption"><strong>Data:</strong> {dataStr}</Typography>
            <Typography variant="caption"><strong>Hora:</strong> {horaStr}</Typography>
            <Typography variant="caption"><strong>Pergunta:</strong> {PERFIL.length + qAtual + 1}/{totalSteps}</Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography variant="caption" fontWeight={600}>{PERFIL.length + qAtual + 1}/{totalSteps}</Typography>
              <Typography variant="caption" color="text.secondary">{Math.round(progressPct)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(progressPct, 100)} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2, fontSize: '1rem', lineHeight: 1.4 }}>{p.titulo}</Typography>

          {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {p.opcoes?.map((o) => (
                <Paper
                  key={o} variant="outlined"
                  onClick={() => { responder(p.id, o); if (!isLast) setTimeout(() => setQAtual((q) => q + 1), 100) }}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer', transition: '0.15s',
                    borderColor: respostas[p.id] === o ? 'primary.main' : 'divider',
                    bgcolor: respostas[p.id] === o ? 'primary.main' : 'transparent',
                    color: respostas[p.id] === o ? '#fff' : 'text.primary',
                    '&:hover': { bgcolor: respostas[p.id] === o ? 'primary.dark' : 'action.hover', borderColor: 'primary.light' },
                  }}
                >
                  <Typography variant="body2" fontWeight={respostas[p.id] === o ? 600 : 400}>{o}</Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <TextField
              value={respostas[p.id] || ''}
              onChange={(e) => setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter' && respostas[p.id]?.trim()) { responder(p.id, respostas[p.id]); if (!isLast) setTimeout(() => setQAtual((q) => q + 1), 100) } }}
              placeholder="Digite a resposta e pressione Enter..." multiline rows={3} fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Observações do entrevistador</Typography>
            <TextField value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre esta pergunta..." multiline rows={2} size="small" fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
          </Box>
        </Paper>

        {/* Botão Salvar Pesquisa aparece após responder todas */}
        {todasRespondidas && (
          <Button variant="contained" color="success" size="large" startIcon={<SaveIcon />} onClick={salvarTudo} disabled={salvando} fullWidth sx={{ borderRadius: 2, py: 1.5, fontSize: '1rem' }}>
            {salvando ? 'Salvando...' : 'Salvar Pesquisa'}
          </Button>
        )}
      </Box>
    )
  }

  // Etapa 1 — Perfil
  if (etapa === 1) {
    const campo = PERFIL[pAtual]
    if (!campo) { salvarPerfil(); return null }
    const total = PERFIL.length
    const isLastPerfil = pAtual === total - 1

    return (
      <Box sx={{ maxWidth: 520, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'action.hover' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
            <Typography variant="caption"><strong>Nº:</strong> Pendente</Typography>
            <Typography variant="caption"><strong>Data:</strong> {dataStr}</Typography>
            <Typography variant="caption"><strong>Hora:</strong> {horaStr}</Typography>
            <Typography variant="caption"><strong>Perfil:</strong> {pAtual + 1}/{total}</Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography variant="caption" fontWeight={600}>{pAtual + 1}/{total}</Typography>
              <Typography variant="caption" color="text.secondary">{Math.round(progressPct)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPct} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Perfil do Entrevistado</Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2, mt: 0.5, fontSize: '1rem' }}>{campo.label}</Typography>

          {campo.type === 'select' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {campo.opts.map((o) => (
                <Paper key={o} variant="outlined"
                  onClick={() => { setPerfil((prev) => ({ ...prev, [campo.id]: o })); setTimeout(() => { if (!isLastPerfil) setPAtual((p) => p + 1); else salvarPerfil() }, 120) }}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer', transition: '0.15s',
                    borderColor: perfil[campo.id] === o ? 'primary.main' : 'divider',
                    bgcolor: perfil[campo.id] === o ? 'primary.main' : 'transparent',
                    color: perfil[campo.id] === o ? '#fff' : 'text.primary',
                    '&:hover': { bgcolor: perfil[campo.id] === o ? 'primary.dark' : 'action.hover', borderColor: 'primary.light' },
                  }}
                >
                  <Typography variant="body2" fontWeight={perfil[campo.id] === o ? 600 : 400}>{o}</Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <TextField
              value={perfil[campo.id] || ''}
              onChange={(e) => setPerfil((prev) => ({ ...prev, [campo.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter' && perfil[campo.id]?.trim()) { if (!isLastPerfil) setPAtual((p) => p + 1); else salvarPerfil() } }}
              placeholder={`${campo.label} e pressione Enter...`}
              type={campo.type === 'number' ? 'number' : 'text'} fullWidth autoFocus
              inputProps={campo.maxLen ? { maxLength: campo.maxLen } : {}}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          )}
        </Paper>
      </Box>
    )
  }

  // Tela inicial
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
        <Button variant="contained" disabled={!pesquisaId} onClick={iniciar} fullWidth sx={{ py: 1.5, borderRadius: 2 }}>
          Iniciar Coleta
        </Button>
      </Paper>
    </Box>
  )
}
