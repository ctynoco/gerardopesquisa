import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MicIcon from '@mui/icons-material/Mic'
import TimerIcon from '@mui/icons-material/Timer'
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

const STORAGE_KEY = 'rascunho_coleta'

export default function Coleta() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [pesquisaTitulo, setPesquisaTitulo] = useState('')
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
  const [resumeModal, setResumeModal] = useState(false)
  const [erro, setErro] = useState('')
  const [tempoSeg, setTempoSeg] = useState(0)
  const [ouvindo, setOuvindo] = useState(false)
  const [autoAvancando, setAutoAvancando] = useState(false)

  const timerRef = useRef(null)
  const autoAdvanceRef = useRef(null)
  const recognitionRef = useRef(null)

  const now = new Date()
  const dataStr = now.toLocaleDateString('pt-BR')
  const horaStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const online = navigator.onLine

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas))
  }, [])

  useEffect(() => {
    const rascunho = localStorage.getItem(STORAGE_KEY)
    if (rascunho) setResumeModal(true)
  }, [])

  useEffect(() => {
    if (etapa === 2 && perguntas.length > 0) {
      setTempoSeg(0)
      timerRef.current = setInterval(() => setTempoSeg((t) => t + 1), 1000)
      return () => clearInterval(timerRef.current)
    }
    setTempoSeg(0)
  }, [etapa, qAtual])

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current) }
  }, [])

  function salvarRascunho() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pesquisaId, pesquisaTitulo, perfil, respostas, entrevistadoId, qAtual, etapa, pAtual, observacoes,
        data: new Date().toISOString(),
      }))
    } catch {}
  }

  function continuarRascunho() {
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (r) {
        setPesquisaId(r.pesquisaId)
        setPesquisaTitulo(r.pesquisaTitulo || '')
        setPerfil(r.perfil || {})
        setRespostas(r.respostas || {})
        setEntrevistadoId(r.entrevistadoId)
        setQAtual(r.qAtual || 0)
        setEtapa(r.etapa || 0)
        setPAtual(r.pAtual || 0)
        setObservacoes(r.observacoes || '')
        if (r.pesquisaId) {
          api.get(`/perguntas?pesquisa_id=${r.pesquisaId}`).then((res) => {
            const lista = res.data?.perguntas || res.data || []
            setPerguntas(Array.isArray(lista) ? lista : [])
          }).catch(() => setPerguntas([]))
        }
      }
    } catch {}
    setResumeModal(false)
  }

  function limparRascunho() {
    localStorage.removeItem(STORAGE_KEY)
    setResumeModal(false)
  }

  function iniciar() {
    setPesquisaTitulo(pesquisas.find((p) => String(p.id) === String(pesquisaId))?.titulo || '')
    api.get(`/perguntas?pesquisa_id=${pesquisaId}`).then((r) => {
      const lista = r.data?.perguntas || r.data || []
      setPerguntas(Array.isArray(lista) ? lista : [])
      setEtapa(1)
    }).catch(() => { setPerguntas([]); setEtapa(1) })
  }

  async function salvarPerfil() {
    const body = { pesquisa_id: Number(pesquisaId), ...perfil, consentimento_lgpd: true }
    if (body.idade) body.idade = Number(body.idade)
    if (body.estado) body.estado = String(body.estado).slice(0, 2)
    const r = await api.post('/entrevistados', body).catch((e) => { console.error('Erro entrevistados:', e.response?.data || e.message); return null })
    if (!r) { setErro('Erro ao salvar perfil. Verifique os dados e tente novamente.'); return }
    setEntrevistadoId(r.data.entrevistado.id)
    setEtapa(2)
    salvarRascunho()
  }

  async function salvarRespostaApi(perguntaId, valor) {
    if (!entrevistadoId) return
    const payload = {
      pesquisa_id: Number(pesquisaId), pergunta_id: Number(perguntaId),
      entrevistado_id: Number(entrevistadoId), resposta: { valor },
      tempo_seg: tempoSeg,
    }
    if (!online) {
      try {
        const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
        fila.push({ url: '/respostas', method: 'POST', body: payload })
        localStorage.setItem('fila_offline', JSON.stringify(fila))
      } catch {}
      return
    }
    await api.post('/respostas', payload).catch(() => {})
  }

  function resetar() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('fila_offline')
    setEtapa(0); setPesquisaId(''); setPerguntas([]); setRespostas({}); setPerfil({})
    setQAtual(0); setPAtual(0); setEntrevistadoId(null); setObservacoes(''); setConcluido(false); setErro('')
    setTempoSeg(0)
  }

  async function salvarTudo() {
    setSalvando(true)
    setErro('')
    for (const [pid, valor] of Object.entries(respostas)) {
      if (!online) {
        const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
        fila.push({
          url: '/respostas', method: 'POST',
          body: { pesquisa_id: Number(pesquisaId), pergunta_id: Number(pid), entrevistado_id: Number(entrevistadoId), resposta: { valor } },
        })
        localStorage.setItem('fila_offline', JSON.stringify(fila))
      } else {
        await salvarRespostaApi(pid, valor)
      }
    }
    if (online) {
      setSalvando(false)
      setConcluido(true)
      localStorage.removeItem(STORAGE_KEY)
    } else {
      setSalvando(false)
      setConcluido(true)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function selecionar(valor) {
    const p = perguntas[qAtual]
    if (!p) return
    setRespostas((prev) => ({ ...prev, [p.id]: valor }))
    setErro('')
    salvarRascunho()
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    setAutoAvancando(true)
    autoAdvanceRef.current = setTimeout(() => {
      setAutoAvancando(false)
      proxima()
    }, 700)
  }

  function proxima() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    setAutoAvancando(false)
    const p = perguntas[qAtual]
    if (!p) return
    if (!respostas[p.id] && p.tipo !== 'aberta') { setErro('Selecione uma resposta.'); return }
    salvarRespostaApi(p.id, respostas[p.id])
    if (qAtual < perguntas.length - 1) setQAtual((q) => q + 1)
    setErro('')
    salvarRascunho()
  }

  function anterior() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    setAutoAvancando(false)
    setErro('')
    if (qAtual > 0) setQAtual((q) => q - 1)
  }

  function lerEmVozAlta(texto) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(texto)
    utt.lang = 'pt-BR'
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }

  function iniciarVoz() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.lang = 'pt-BR'
    rec.continuous = false
    rec.interimResults = false
    recognitionRef.current = rec
    setOuvindo(true)

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase()
      setOuvindo(false)
      const p = perguntas[qAtual]
      if (!p || !p.opcoes) return
      const match = p.opcoes.find((o) => o.toLowerCase().includes(transcript) || transcript.includes(o.toLowerCase()))
      if (match) selecionar(match)
    }
    rec.onerror = () => setOuvindo(false)
    rec.onend = () => setOuvindo(false)
    rec.start()
  }

  function formatTempo(s) {
    const min = Math.floor(s / 60)
    const seg = s % 60
    return `${min}:${String(seg).padStart(2, '0')}`
  }

  const perfilOk = PERFIL.every((c) => perfil[c.id]?.toString().trim())
  const totalSteps = PERFIL.length + perguntas.length
  const currentStep = etapa === 1 ? pAtual : etapa === 2 && perguntas.length > 0 ? PERFIL.length + qAtual : 0
  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  if (etapa === 3) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: '2px solid', borderColor: 'success.main', borderRadius: 3 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 70, mb: 2 }} />
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontSize: '1.3rem' }}>Pesquisa Concluída</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            A presente entrevista foi concluída e validada pelo sistema.
          </Typography>
          <Box sx={{ textAlign: 'left', backgroundColor: 'action.hover', p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Nº:</strong> {entrevistadoId}</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Entrevistado:</strong> {perfil.nome}</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}><strong>Data:</strong> {dataStr}</Typography>
            <Typography variant="caption" display="block"><strong>Hora:</strong> {horaStr}</Typography>
          </Box>
          <Button variant="contained" color="success" size="large" onClick={resetar} sx={{ borderRadius: 2, py: 1.5, px: 5, fontSize: '1rem' }}>
            Finalizar
          </Button>
        </Paper>
      </Box>
    )
  }

  if (etapa === 2) {
    if (perguntas.length === 0) {
      return (
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">Nenhuma pergunta encontrada para esta pesquisa.</Typography>
            <Button variant="outlined" onClick={resetar} sx={{ mt: 2, borderRadius: 2 }}>Voltar</Button>
          </Paper>
        </Box>
      )
    }

    const p = perguntas[qAtual]
    if (!p) { setQAtual(0); return null }

    if (concluido) {
      return (
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: '2px solid', borderColor: 'success.main', borderRadius: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 70, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontSize: '1.3rem' }}>Pesquisa Concluída</Typography>
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
              Finalizar
            </Button>
          </Paper>
        </Box>
      )
    }

    const jaRespondeu = !!respostas[p.id]
    const isLast = qAtual === perguntas.length - 1
    const podeAvancar = isLast ? jaRespondeu : !!respostas[p.id] || p.tipo !== 'aberta'

    return (
      <Box sx={{ maxWidth: 520, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'action.hover' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <TimerIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.25 }} />
                  {formatTempo(tempoSeg)}
                </Typography>
                <Typography variant="caption" color="text.secondary">{Math.round(progressPct)}%</Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(progressPct, 100)} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body1" fontWeight={700} sx={{ fontSize: '1.1rem', lineHeight: 1.4, flex: 1 }}>
              {qAtual + 1}. {p.titulo}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
              {'speechSynthesis' in window && (
                <Tooltip title="Ouvir pergunta">
                  <IconButton size="small" onClick={() => lerEmVozAlta(p.titulo)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <VolumeUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && p.opcoes && (
                <Tooltip title="Responder por voz">
                  <IconButton size="small" onClick={iniciarVoz} color={ouvindo ? 'error' : 'default'} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <MicIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {ouvindo && (
            <Paper elevation={0} sx={{ p: 1, mb: 1.5, bgcolor: 'error.light', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" fontWeight={600} color="white">🎤 Ouvindo... fale sua resposta</Typography>
            </Paper>
          )}

          {erro && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
              {erro}
            </Typography>
          )}

          {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {p.opcoes?.map((o) => (
                <Paper key={o} variant="outlined" onClick={() => selecionar(o)}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer', transition: '0.15s',
                    borderColor: respostas[p.id] === o ? '#0d6efd' : '#ccc',
                    bgcolor: respostas[p.id] === o ? '#eef4ff' : 'transparent',
                    '&:hover': { bgcolor: '#f0f7ff', borderColor: '#0d6efd' },
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{
                      width: 18, height: 18, borderRadius: '50%', border: '2px solid',
                      borderColor: respostas[p.id] === o ? '#0d6efd' : '#999',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {respostas[p.id] === o && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0d6efd' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={respostas[p.id] === o ? 600 : 400}>{o}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <TextField value={respostas[p.id] || ''} onChange={(e) => selecionar(e.target.value)}
              placeholder="Digite sua resposta..." multiline rows={3} fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }} />
          )}

          {autoAvancando && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Avançando...</Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Observações</Typography>
            <TextField value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações..." multiline rows={2} size="small" fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
          </Box>
        </Paper>

        {!online && (
          <Paper elevation={0} sx={{ p: 1, mb: 1.5, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" fontWeight={600}>Modo offline — dados serão sincronizados quando houver internet</Typography>
          </Paper>
        )}

        {isLast && jaRespondeu ? (
          <Button variant="contained" color="success" size="large" startIcon={<CheckCircleIcon />} onClick={salvarTudo} disabled={salvando} fullWidth sx={{ borderRadius: 2, py: 1.5, fontSize: '1rem' }}>
            {salvando ? 'Salvando...' : 'Salvar Pesquisa'}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {qAtual > 0 && (
              <Button variant="contained" onClick={anterior} sx={{ borderRadius: 2, py: 1.2, flex: 1, bgcolor: '#6c757d', '&:hover': { bgcolor: '#5a6268' } }}>
                Voltar
              </Button>
            )}
            <Button variant="contained" onClick={proxima} disabled={!podeAvancar} sx={{ borderRadius: 2, py: 1.2, flex: 1, bgcolor: '#0d6efd' }}>
              Próxima
            </Button>
          </Box>
        )}
      </Box>
    )
  }

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
            <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Perfil do Entrevistado</Typography>
              <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, fontSize: '1.1rem' }}>{campo.label}</Typography>
            </Box>
            {'speechSynthesis' in window && (
              <Tooltip title="Ouvir pergunta">
                <IconButton size="small" onClick={() => lerEmVozAlta(campo.label)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <VolumeUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {campo.type === 'select' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {campo.opts.map((o) => (
                <Paper key={o} variant="outlined"
                  onClick={() => { setPerfil((prev) => ({ ...prev, [campo.id]: o })); salvarRascunho(); setTimeout(() => { if (!isLastPerfil) setPAtual((p) => p + 1); else salvarPerfil() }, 120) }}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer', transition: '0.15s',
                    borderColor: perfil[campo.id] === o ? '#0d6efd' : '#ccc',
                    bgcolor: perfil[campo.id] === o ? '#eef4ff' : 'transparent',
                    '&:hover': { bgcolor: '#f0f7ff', borderColor: '#0d6efd' },
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{
                      width: 18, height: 18, borderRadius: '50%', border: '2px solid',
                      borderColor: perfil[campo.id] === o ? '#0d6efd' : '#999',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {perfil[campo.id] === o && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0d6efd' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={perfil[campo.id] === o ? 600 : 400}>{o}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <TextField value={perfil[campo.id] || ''}
              onChange={(e) => setPerfil((prev) => ({ ...prev, [campo.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter' && perfil[campo.id]?.trim()) { salvarRascunho(); if (!isLastPerfil) setPAtual((p) => p + 1); else salvarPerfil() } }}
              placeholder={`${campo.label} e pressione Enter`}
              type={campo.type === 'number' ? 'number' : 'text'} fullWidth autoFocus
              inputProps={campo.maxLen ? { maxLength: campo.maxLen } : {}}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          )}
        </Paper>
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
        <Button variant="contained" disabled={!pesquisaId} onClick={iniciar} fullWidth sx={{ py: 1.5, borderRadius: 2 }}>
          Iniciar Coleta
        </Button>
      </Paper>

      <Dialog open={resumeModal} onClose={() => setResumeModal(false)}>
        <DialogTitle>Pesquisa Encontrada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Foi encontrada uma entrevista em andamento. Deseja continuar de onde parou?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          <Button variant="contained" onClick={continuarRascunho} sx={{ borderRadius: 2, bgcolor: '#0d6efd' }}>CONTINUAR</Button>
          <Button variant="contained" onClick={limparRascunho} sx={{ borderRadius: 2, bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}>NOVA</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
