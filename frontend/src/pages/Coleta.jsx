import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel, Chip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import api from '../services/api'

export default function Coleta() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [entrevistado, setEntrevistado] = useState({ nome: '', idade: '', cidade: '', estado: '' })
  const [etapa, setEtapa] = useState(0)

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  async function iniciarColeta() {
    const res = await api.get(`/perguntas?pesquisa_id=${pesquisaId}`)
    setPerguntas(res.data.perguntas)
    setEtapa(1)
  }

  async function salvarEntrevistado() {
    const res = await api.post('/entrevistados', { ...entrevistado, pesquisa_id: Number(pesquisaId) })
    setEntrevistado({ ...res.data.entrevistado, ...entrevistado })
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
    })
  }

  function finalizar() {
    alert('Coleta finalizada!')
    setEtapa(0)
    setPesquisaId('')
    setPerguntas([])
    setRespostas({})
    setEntrevistado({ nome: '', idade: '', cidade: '', estado: '' })
  }

  const steps = ['Selecionar Pesquisa', 'Dados do Entrevistado', 'Questionário']

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h1" sx={{ mb: 3 }}>Coleta de Dados</Typography>

      <Stepper activeStep={etapa} sx={{ mb: 4 }}>
        {steps.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>

      {etapa === 0 && (
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Selecione a pesquisa</InputLabel>
              <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={iniciarColeta} sx={{ alignSelf: 'flex-start' }}>
              Iniciar Coleta
            </Button>
          </CardContent>
        </Card>
      )}

      {etapa === 1 && (
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 4 }}>
            <TextField label="Nome" value={entrevistado.nome} onChange={(e) => setEntrevistado({...entrevistado, nome: e.target.value})} size="small" fullWidth />
            <TextField label="Idade" type="number" value={entrevistado.idade} onChange={(e) => setEntrevistado({...entrevistado, idade: e.target.value})} size="small" fullWidth />
            <TextField label="Cidade" value={entrevistado.cidade} onChange={(e) => setEntrevistado({...entrevistado, cidade: e.target.value})} size="small" fullWidth />
            <TextField label="Estado" value={entrevistado.estado} onChange={(e) => setEntrevistado({...entrevistado, estado: e.target.value})} inputProps={{ maxLength: 2 }} size="small" fullWidth />
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={salvarEntrevistado} sx={{ alignSelf: 'flex-start' }}>
              Começar Perguntas
            </Button>
          </CardContent>
        </Card>
      )}

      {etapa === 2 && (
        <Box>
          <Chip label={`Entrevistado: ${entrevistado.nome}`} color="primary" sx={{ mb: 2 }} />

          {perguntas.map((p) => (
            <Card key={p.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5 }}>{p.titulo}</Typography>
                {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {p.opcoes?.map((o) => (
                      <Chip key={o} label={o} clickable color={respostas[p.id] === o ? 'primary' : 'default'} variant={respostas[p.id] === o ? 'filled' : 'outlined'} onClick={() => responder(p.id, o)} />
                    ))}
                  </Box>
                ) : (
                  <TextField value={respostas[p.id] || ''} onChange={(e) => responder(p.id, e.target.value)} placeholder="Resposta..." size="small" fullWidth />
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={finalizar} sx={{ mt: 1 }}>
            Finalizar Coleta
          </Button>
        </Box>
      )}
    </Box>
  )
}
