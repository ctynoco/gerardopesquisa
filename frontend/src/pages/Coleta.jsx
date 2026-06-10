import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel, LinearProgress, Paper, Chip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import api from '../services/api'

const btnSx = { py: 1.8, px: 3, fontSize: '1rem', borderRadius: 2, width: '100%' }

export default function Coleta() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [entrevistado, setEntrevistado] = useState({ nome: '', idade: '', cidade: '', estado: '' })
  const [etapa, setEtapa] = useState(0)
  const [qAtual, setQAtual] = useState(0)

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  function iniciarColeta() {
    api.get(`/perguntas?pesquisa_id=${pesquisaId}`).then((res) => {
      setPerguntas(res.data.perguntas)
      setEtapa(1)
    })
  }

  async function salvarEntrevistado() {
    const res = await api.post('/entrevistados', { ...entrevistado, pesquisa_id: Number(pesquisaId) })
    setEntrevistado((prev) => ({ ...prev, id: res.data.entrevistado?.id }))
    setEtapa(2)
  }

  async function responder(perguntaId, valor) {
    const eid = entrevistado.id || (await api.post('/entrevistados', { ...entrevistado, pesquisa_id: Number(pesquisaId) })).data.entrevistado.id
    if (!entrevistado.id) setEntrevistado((prev) => ({ ...prev, id: eid }))
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
    await api.post('/respostas', {
      pesquisa_id: Number(pesquisaId),
      pergunta_id: Number(perguntaId),
      entrevistado_id: Number(eid),
      resposta: { valor },
    }).catch(() => {})
    if (perguntaId === perguntas[perguntas.length - 1]?.id) return
    setQAtual((q) => Math.min(q + 1, perguntas.length - 1))
  }

  function finalizar() {
    alert('Coleta finalizada!')
    setEtapa(0)
    setPesquisaId('')
    setPerguntas([])
    setRespostas({})
    setEntrevistado({ nome: '', idade: '', cidade: '', estado: '' })
    setQAtual(0)
  }

  if (etapa === 2 && perguntas.length > 0) {
    const p = perguntas[qAtual]
    const answered = Object.keys(respostas).length
    const progress = Math.round((answered / perguntas.length) * 100)
    const isLast = qAtual === perguntas.length - 1

    return (
      <Box sx={{ maxWidth: 500, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>{answered}/{perguntas.length}</Typography>
              <Typography variant="body2" color="text.secondary">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
            Pergunta {qAtual + 1}
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '1.15rem', lineHeight: 1.4, mb: 2.5 }}>{p.titulo}</Typography>

          {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {p.opcoes?.map((o) => (
                <Button
                  key={o}
                  variant={respostas[p.id] === o ? 'contained' : 'outlined'}
                  onClick={() => responder(p.id, o)}
                  sx={{ ...btnSx, justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}
                >
                  {o}
                </Button>
              ))}
            </Box>
          ) : (
            <TextField
              value={respostas[p.id] || ''}
              onChange={(e) => setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))}
              placeholder="Digite a resposta..."
              multiline rows={3}
              fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          )}
        </Paper>

        {p.tipo === 'aberta' && (
          <Button
            variant="contained"
            endIcon={isLast ? <CheckCircleIcon /> : <ArrowForwardIcon />}
            onClick={() => responder(p.id, respostas[p.id] || '')}
            disabled={!respostas[p.id]}
            sx={btnSx}
          >
            {isLast ? 'Finalizar' : 'Próxima'}
          </Button>
        )}

        {isLast && Object.keys(respostas).length >= perguntas.length && (
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={finalizar} sx={btnSx}>
            Finalizar Coleta
          </Button>
        )}

        {qAtual > 0 && (
          <Button variant="text" onClick={() => setQAtual((q) => q - 1)} sx={{ mt: 1, width: '100%' }}>
            Pergunta anterior
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h1" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HowToVoteIcon /> Coleta
      </Typography>

      <Stepper activeStep={etapa} sx={{ mb: 4 }} alternativeLabel>
        {['Pesquisa', 'Entrevistado', 'Questionário'].map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>

      {etapa === 0 && (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Selecione a pesquisa</InputLabel>
            <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
              {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={iniciarColeta} sx={btnSx}>
            Iniciar Coleta
          </Button>
        </Paper>
      )}

      {etapa === 1 && (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nome" value={entrevistado.nome} onChange={(e) => setEntrevistado({...entrevistado, nome: e.target.value})} fullWidth sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
            <TextField label="Idade" type="number" value={entrevistado.idade} onChange={(e) => setEntrevistado({...entrevistado, idade: e.target.value})} fullWidth sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
            <TextField label="Cidade" value={entrevistado.cidade} onChange={(e) => setEntrevistado({...entrevistado, cidade: e.target.value})} fullWidth sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
            <TextField label="Estado" value={entrevistado.estado} onChange={(e) => setEntrevistado({...entrevistado, estado: e.target.value})} inputProps={{ maxLength: 2 }} fullWidth sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
            <Button variant="contained" startIcon={<ArrowForwardIcon />} onClick={salvarEntrevistado} sx={btnSx}>
              Começar Perguntas
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
