import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Paper, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Grid, Accordion, AccordionSummary, AccordionDetails, InputAdornment, Tabs, Tab, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import modelos from '../data/modelosPerguntas'
import api from '../services/api'
import { questionarioSchema, perguntaSchema, validate } from '../validations/schemas'

const tipos = [
  { value: 'unica_escolha', label: '01. Única Escolha' },
  { value: 'multipla_escolha', label: '02. Múltipla Escolha' },
  { value: 'sim_nao', label: '03. Sim / Não' },
  { value: 'escala_avaliacao', label: '04. Escala de Avaliação' },
  { value: 'escala_likert', label: '05. Escala Likert' },
  { value: 'nota_0_10', label: '06. Nota de 0 a 10' },
  { value: 'ranking', label: '07. Ranking' },
  { value: 'matriz', label: '08. Matriz' },
  { value: 'texto_curto', label: '09. Texto Curto' },
  { value: 'texto_longo', label: '10. Texto Longo' },
  { value: 'voto_espontaneo', label: '11. Intenção de Voto Espontânea' },
  { value: 'voto_estimulado', label: '12. Intenção de Voto Estimulada' },
  { value: 'rejeicao_candidato', label: '13. Rejeição de Candidato' },
  { value: 'segundo_turno', label: '14. Simulação de Segundo Turno' },
  { value: 'aprovacao_desaprovacao', label: '15. Aprovação / Desaprovação' },
  { value: 'conhecimento_candidato', label: '16. Conhecimento de Candidato' },
  { value: 'grau_decisao_voto', label: '17. Grau de Decisão do Voto' },
  { value: 'problema_prioritario', label: '18. Problema Prioritário' },
  { value: 'prioridade_investimento', label: '19. Prioridade de Investimento' },
  { value: 'perfil_eleitor', label: '20. Perfil do Eleitor' },
  { value: 'faixa_etaria', label: '21. Faixa Etária' },
  { value: 'sexo', label: '22. Sexo' },
  { value: 'escolaridade', label: '23. Escolaridade' },
  { value: 'faixa_renda', label: '24. Faixa de Renda' },
  { value: 'municipio', label: '25. Município' },
  { value: 'bairro', label: '26. Bairro' },
  { value: 'zona_eleitoral', label: '27. Zona Eleitoral' },
  { value: 'secao_eleitoral', label: '28. Seção Eleitoral' },
  { value: 'geolocalizacao', label: '29. Geolocalização (GPS)' },
  { value: 'comentario_aberto', label: '30. Comentário Aberto' },
]

export default function Questionario() {
  const [nome, setNome] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [amostra, setAmostra] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [pesquisaId, setPesquisaId] = useState(null)

  const [editando, setEditando] = useState({ titulo: '', tipo: 'unica_escolha', opcoes: '' })
  const [busca, setBusca] = useState('')
  const [expanded, setExpanded] = useState('')

  const [erro, setErro] = useState('')
  const [printOpen, setPrintOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [pesquisasSalvas, setPesquisasSalvas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [buscaLoad, setBuscaLoad] = useState('')
  const [abaDireita, setAbaDireita] = useState(0)
  function abrirCarregar() {
    setCarregando(true)
    setLoadOpen(true)
    setBuscaLoad('')
    api.get('/pesquisas?limit=100').then((r) => {
      setPesquisasSalvas(r.data.pesquisas)
      setCarregando(false)
    }).catch(() => setCarregando(false))
  }

  async function carregarQuestionario(pid) {
    setLoadOpen(false)
    setCarregando(true)
    try {
      const [pesqRes, perguntasRes] = await Promise.all([
        api.get(`/pesquisas/${pid}`),
        api.get(`/perguntas?pesquisa_id=${pid}`),
      ])
      const pesq = pesqRes.data.pesquisa
      const pergList = perguntasRes.data.perguntas || perguntasRes.data || []

      setNome(pesq.titulo || '')
      setPesquisaId(pesq.id)

      const desc = pesq.descricao || ''
      const munMatch = desc.match(/^(.+?)\s*\|/)
      if (munMatch) setMunicipio(munMatch[1].trim())

      setData(pesq.data_inicio || new Date().toISOString().slice(0, 10))
      setAmostra(pesq.tamanho_amostra ? String(pesq.tamanho_amostra) : '')

      const carregadas = pergList.map((p) => ({
        titulo: p.titulo,
        tipo: p.tipo,
        opcoes: p.opcoes,
        _salva: true,
        _id: p.id,
      }))
      setPerguntas(carregadas)
      setErro(`Questionário "${pesq.titulo}" carregado com sucesso!`)
      setAbaDireita(1)
    } catch (err) {
      setErro('Erro ao carregar questionário')
    } finally {
      setCarregando(false)
    }
  }

  function imprimir() {
    setPrintOpen(true)
    setTimeout(() => {
      window.print()
    }, 500)
  }

  async function adicionar(pp) {
    const p = pp || editando
    const v = validate(perguntaSchema, p)
    if (!v.valid) { setErro(v.errors.map((e) => e.message).join(', ')); return }
    const nova = { titulo: p.titulo, tipo: p.tipo }
    if (p.opcoes?.length) nova.opcoes = p.opcoes
    else if (typeof p.opcoes === 'string' && p.opcoes.trim()) nova.opcoes = p.opcoes.split(',').map((s) => s.trim())
    setPerguntas((prev) => [...prev, { ...nova, _salva: false, _id: null }])
    if (!pp) setEditando({ titulo: '', tipo: 'unica_escolha', opcoes: '' })
    setErro('')
  }

  function remover(idx) {
    setPerguntas((prev) => prev.filter((_, i) => i !== idx))
  }

  async function salvarUma(pp, idx) {
    if (!pesquisaId && !nome.trim()) { setErro('Informe o nome do questionário primeiro'); return }
    let pid = pesquisaId
    try {
      if (!pid) {
        const r = await api.post('/pesquisas', {
          titulo: nome, descricao: `${nome} | ${municipio} | ${data} | Amostra: ${amostra}`,
          margem_erro: 3, nivel_confianca: 95, tamanho_amostra: Number(amostra) || null,
        })
        pid = r.data?.pesquisa?.id || r.data?.id
        setPesquisaId(pid)
      }
      const r = await api.post('/perguntas', {
        pesquisa_id: pid, titulo: pp.titulo, tipo: pp.tipo,
        opcoes: pp.opcoes || null, ordenacao: idx + 1,
      })
      const saved = r.data?.pergunta || r.data
      setPerguntas((prev) => prev.map((q, i) => i === idx ? { ...q, _salva: true, _id: saved.id } : q))
      setErro('')
    } catch (err) { setErro(err.response?.data?.error || 'Erro ao salvar') }
  }

  async function excluirUma(pp, idx) {
    try {
      if (pp._id) await api.delete(`/perguntas/${pp._id}`)
    } catch (err) { console.error('Erro ao excluir', err) }
    setPerguntas((prev) => prev.filter((_, i) => i !== idx))
  }

  async function salvarQuestionario() {
    const v = validate(questionarioSchema, { nome, municipio, data, amostra })
    if (!v.valid) { setErro(v.errors.map((e) => e.message).join(', ')); return }
    let pid = pesquisaId
    try {
      if (!pid) {
        const r = await api.post('/pesquisas', {
          titulo: nome, descricao: `${nome} | ${municipio} | ${data} | Amostra: ${amostra}`,
          margem_erro: 3, nivel_confianca: 95, tamanho_amostra: Number(amostra) || null,
        })
        pid = r.data?.pesquisa?.id || r.data?.id
        setPesquisaId(pid)
      }
      for (const [i, p] of perguntas.entries()) {
        if (!p._salva) {
          const r = await api.post('/perguntas', { pesquisa_id: pid, titulo: p.titulo, tipo: p.tipo, opcoes: p.opcoes || null, ordenacao: i + 1 })
          const saved = r.data?.pergunta || r.data
          p._salva = true; p._id = saved.id
        }
      }
      setErro(`Questionário salvo! ID: ${pid}`)
    } catch (err) { setErro(err.response?.data?.error || 'Erro ao salvar questionário') }
  }

  function adicionarModelo(p) {
    adicionar(p)
  }

  const filtrados = modelos.map((cat) => ({
    ...cat,
    perguntas: cat.perguntas.filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase())),
  })).filter((cat) => cat.perguntas.length > 0)

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 2 }}>Criar Questionário</Typography>

      <Grid container spacing={2}>
        {/* Coluna Esquerda — Formulário + Perguntas */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField label="Nome do Questionário" value={nome} onChange={(e) => setNome(e.target.value)} size="small" fullWidth />
              <Grid container spacing={1}>
                <Grid item xs={6}><TextField label="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} size="small" fullWidth /></Grid>
                <Grid item xs={3}><TextField label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={3}><TextField label="Amostra" type="number" value={amostra} onChange={(e) => setAmostra(e.target.value)} size="small" fullWidth /></Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField label="Título da pergunta" value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} size="small" fullWidth />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={editando.tipo} label="Tipo" onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                      {tipos.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  {!['texto_curto', 'texto_longo', 'comentario_aberto', 'geolocalizacao', 'data'].includes(editando.tipo) && (
                    <TextField label="Opções / Rótulos (separados por ,)" value={editando.opcoes} onChange={(e) => setEditando({ ...editando, opcoes: e.target.value })} size="small" fullWidth />
                  )}
                </Grid>
              </Grid>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => adicionar()} disabled={!editando.titulo.trim()} sx={{ borderRadius: 2 }}>
                Adicionar Pergunta
              </Button>
            </Box>
          </Paper>

          {erro && <Typography variant="body2" color={erro.includes('sucesso') ? 'success.main' : 'error'} sx={{ mb: 1, fontWeight: 500 }}>{erro}</Typography>}

          <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Perguntas ({perguntas.length})</Typography>

          {perguntas.map((p, i) => (
            <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500}>{i + 1}. {p.titulo}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={p.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    {p.opcoes && <Chip label={`${p.opcoes.length} opts`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                    {p._salva && <Chip label="Salva" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  {!p._salva && (
                    <Button size="small" variant="outlined" color="success" startIcon={<SaveIcon />} onClick={() => salvarUma(p, i)} sx={{ fontSize: '0.65rem', py: 0.2, minWidth: 0 }}>
                      Salvar
                    </Button>
                  )}
                  <IconButton size="small" color="error" onClick={() => excluirUma(p, i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}

          {perguntas.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={salvarQuestionario} fullWidth sx={{ py: 1.5, borderRadius: 2 }}>
                Salvar Questionário Completo
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={imprimir} sx={{ py: 1.5, borderRadius: 2, whiteSpace: 'nowrap' }}>
                Imprimir
              </Button>
            </Box>
          )}
        </Grid>

        {/* Coluna Direita — Biblioteca | Visualizar | Carregar */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'sticky', top: 16 }}>
            <Tabs value={abaDireita} onChange={(_, v) => setAbaDireita(v)} sx={{ mb: 1.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.75rem' } }}>
              <Tab label="Biblioteca" />
              <Tab label="Visualizar" />
              <Tab label="Carregar" />
            </Tabs>

            {abaDireita === 0 && (
              <>
                <TextField
                  placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} size="small" fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ mb: 1.5, '& .MuiInputBase-root': { borderRadius: 2 } }}
                />
                <Box sx={{ maxHeight: 'calc(100vh - 320px)', overflow: 'auto' }}>
                  {filtrados.map((cat) => (
                    <Accordion key={cat.categoria} expanded={expanded === cat.categoria} onChange={() => setExpanded(expanded === cat.categoria ? '' : cat.categoria)} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 0.5, '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { m: '6px 0' } }}>
                        <Typography variant="caption" fontWeight={600}>{cat.categoria} <Chip label={cat.perguntas.length} size="small" sx={{ height: 18, fontSize: '0.6rem' }} /></Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                        {cat.perguntas.map((p) => (
                          <Box key={p.titulo} sx={{ p: 1, mb: 0.5, backgroundColor: 'action.hover', borderRadius: 1.5, '&:last-child': { mb: 0 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={500} sx={{ display: 'block', lineHeight: 1.2 }}>{p.titulo}</Typography>
                                <Chip label={p.tipo} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', mt: 0.25 }} />
                              </Box>
                              <IconButton size="small" color="primary" onClick={() => adicionarModelo(p)} sx={{ p: 0.5 }}>
                                <LibraryAddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}

            {abaDireita === 1 && perguntas.length > 0 && (
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', fontFamily: '"Times New Roman", Times, serif', fontSize: '11pt', lineHeight: 1.5, color: '#000' }}>
                <Box sx={{ textAlign: 'center', mb: 2, pb: 1.5, borderBottom: '2px double #000' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '14pt', mb: 0.5 }}>QUESTIONÁRIO DE PESQUISA</Typography>
                  <Typography sx={{ fontSize: '12pt', fontWeight: 600 }}>{nome || 'Questionário'}</Typography>
                  {(municipio || data) && (
                    <Typography sx={{ fontSize: '10pt', mt: 0.5 }}>
                      {municipio && `Município: ${municipio}`}{municipio && data ? ' | ' : ''}{data && `Data: ${new Date(data).toLocaleDateString('pt-BR')}`}
                      {amostra && ` | Amostra: ${amostra}`}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 1.5, p: 1, border: '1px solid #999', bgcolor: '#f9f9f9' }}>
                  <Typography sx={{ fontSize: '10pt', fontWeight: 700, mb: 0.5 }}>DADOS DO ENTREVISTADO</Typography>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                    <tbody>
                      <tr><td style={{ padding: '2px 6px', width: '30%' }}><strong>Nome:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Idade:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Sexo:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Escolaridade:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Bairro:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Município:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Typography sx={{ fontSize: '11pt', fontWeight: 700, mb: 1, textAlign: 'center', textTransform: 'uppercase' }}>
                  Roteiro de Perguntas
                </Typography>

                {perguntas.map((p, i) => (
                  <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: i < perguntas.length - 1 ? '1px dashed #ccc' : 'none' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '11pt' }}>{i + 1}.</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '11pt' }}>{p.titulo}</Typography>
                    </Box>
                    {['unica_escolha', 'sim_nao', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral'].includes(p.tipo) && p.opcoes && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {p.opcoes.map((o, oi) => (
                          <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.15 }}>
                            <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '10pt' }}>{o}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {p.tipo === 'multipla_escolha' && p.opcoes && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {p.opcoes.map((o, oi) => (
                          <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.15 }}>
                            <Box component="span" sx={{ width: 12, height: 12, border: '1.5px solid #555', display: 'inline-block', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '10pt' }}>{o}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {['likert', 'escala_likert'].includes(p.tipo) && p.opcoes && (
                      <Box sx={{ ml: 2, mt: 0.5, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                          <thead>
                            <tr>
                              <td style={{ width: '40%', padding: 2 }}><em>Item</em></td>
                              {p.opcoes.map((_, oi) => (
                                <td key={oi} style={{ textAlign: 'center', padding: 2, borderLeft: '1px solid #ccc' }}>{oi + 1}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: 2 }}>{p.titulo}</td>
                              {p.opcoes.map((_, oi) => (
                                <td key={oi} style={{ textAlign: 'center', borderLeft: '1px solid #ccc', padding: 2 }}>
                                  <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </Box>
                    )}
                    {['numerica', 'nota_0_10', 'escala_avaliacao'].includes(p.tipo) && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        <Typography sx={{ fontSize: '9pt', color: '#666', fontStyle: 'italic' }}>Atribua uma nota de 1 a 10:</Typography>
                        <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', mt: 0.25 }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <Box key={n} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                              <Box component="span" sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                              <Typography sx={{ fontSize: '7pt', mt: 0.15 }}>{n}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    {p.tipo === 'ranking' && p.opcoes && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {p.opcoes.map((o, oi) => (
                          <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.15 }}>
                            <Box component="span" sx={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '8pt', fontWeight: 700 }}>{oi + 1}</Box>
                            <Typography sx={{ fontSize: '10pt' }}>{o}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {p.tipo === 'matriz' && p.opcoes && (
                      <Box sx={{ ml: 2, mt: 0.5, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                          <thead>
                            <tr>
                              <td style={{ width: '40%', padding: 2 }}><em>Itens</em></td>
                              {p.opcoes.map((o, oi) => (
                                <td key={oi} style={{ textAlign: 'center', padding: 2, borderLeft: '1px solid #ccc', fontWeight: 700 }}>{o}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: 2 }}>{p.titulo}</td>
                              {p.opcoes.map((_, oi) => (
                                <td key={oi} style={{ textAlign: 'center', borderLeft: '1px solid #ccc', padding: 2 }}>
                                  <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </Box>
                    )}
                    {['texto_curto', 'texto_longo', 'comentario_aberto', 'texto', 'aberta'].includes(p.tipo) && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {[1, (p.tipo === 'texto_longo' || p.tipo === 'aberta') ? 4 : 2].map((l) => (
                          <Box key={l} sx={{ borderBottom: '1px solid #999', mb: 0.5, height: (p.tipo === 'texto_longo' || p.tipo === 'aberta') ? 28 : 20 }} />
                        ))}
                        <Typography sx={{ fontSize: '8pt', color: '#999', fontStyle: 'italic' }}>Resposta:</Typography>
                      </Box>
                    )}
                    {['data'].includes(p.tipo) && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        <Typography sx={{ fontSize: '10pt' }}>___ / ___ / _______</Typography>
                      </Box>
                    )}
                    {p.tipo === 'geolocalizacao' && (
                      <Box sx={{ ml: 2, mt: 0.5, display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: '8pt', color: '#999' }}>Latitude:</Typography><Box sx={{ borderBottom: '1px solid #999', height: 20 }} /></Box>
                        <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: '8pt', color: '#999' }}>Longitude:</Typography><Box sx={{ borderBottom: '1px solid #999', height: 20 }} /></Box>
                      </Box>
                    )}
                    {!['unica_escolha', 'multipla_escolha', 'sim_nao', 'escala_avaliacao', 'escala_likert', 'nota_0_10', 'ranking', 'matriz', 'texto_curto', 'texto_longo', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral', 'geolocalizacao', 'comentario_aberto', 'likert', 'numerica', 'aberta', 'texto', 'data'].includes(p.tipo) && (
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {[1, 2].map((l) => (
                          <Box key={l} sx={{ borderBottom: '1px solid #999', mb: 0.5, height: 20 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}

                <Box sx={{ mt: 2, pt: 1.5, borderTop: '2px solid #000', fontSize: '9pt', color: '#555' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '2px 6px', width: '25%' }}><strong>Entrevistador:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Data:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td></tr>
                      <tr><td style={{ padding: '2px 6px' }}><strong>Observações:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '2px 6px', height: 30 }}>&nbsp;</td></tr>
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}

            {abaDireita === 2 && (
              <Box>
                <TextField
                  placeholder="Buscar questionário..." value={buscaLoad} onChange={(e) => setBuscaLoad(e.target.value)} size="small" fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ mb: 1.5, '& .MuiInputBase-root': { borderRadius: 2 } }}
                />
                <Box sx={{ maxHeight: 'calc(100vh - 320px)', overflow: 'auto' }}>
                  {carregando ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : pesquisasSalvas.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Nenhum questionário salvo encontrado.</Typography>
                  ) : (
                    <List disablePadding>
                      {pesquisasSalvas
                        .filter((p) => p.titulo?.toLowerCase().includes(buscaLoad.toLowerCase()))
                        .map((p) => (
                          <ListItemButton key={p.id} onClick={() => carregarQuestionario(p.id)} divider>
                            <ListItemText
                              primary={p.titulo}
                              secondary={`${new Date(p.created_at || p.data_inicio).toLocaleDateString('pt-BR')}${p.tamanho_amostra ? ` | Amostra: ${p.tamanho_amostra}` : ''}`}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        ))}
                    </List>
                  )}
                  <Button variant="outlined" fullWidth startIcon={<FolderOpenIcon />} onClick={abrirCarregar} sx={{ mt: 1, borderRadius: 2 }}>
                    Atualizar Lista
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} fullScreen
        PaperProps={{ sx: { bgcolor: '#fff', color: '#000' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', pb: 1 }}>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 700 }}>Pré-visualização de Impressão</Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => { window.print(); setPrintOpen(false) }} startIcon={<PrintIcon />} sx={{ borderRadius: 2 }}>
              Imprimir
            </Button>
            <Button variant="outlined" onClick={() => setPrintOpen(false)} sx={{ borderRadius: 2 }}>
              Fechar
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4, '& @media print': { p: 0 } }}>
          <Box className="print-content" sx={{ maxWidth: '210mm', mx: 'auto', fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', lineHeight: 1.6 }}>
            <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '3px double #000' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '18pt', mb: 0.5, color: '#000' }}>QUESTIONÁRIO DE PESQUISA</Typography>
              <Typography sx={{ fontSize: '14pt', fontWeight: 600, color: '#000' }}>{nome || 'Questionário'}</Typography>
              {(municipio || data) && (
                <Typography sx={{ fontSize: '11pt', color: '#333', mt: 0.5 }}>
                  {municipio && `Município: ${municipio}`}{municipio && data ? ' | ' : ''}{data && `Data: ${new Date(data).toLocaleDateString('pt-BR')}`}
                  {amostra && ` | Amostra: ${amostra}`}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2, p: 1.5, border: '1px solid #999', bgcolor: '#f9f9f9' }}>
              <Typography sx={{ fontSize: '11pt', fontWeight: 700, color: '#000', mb: 0.5 }}>DADOS DO ENTREVISTADO</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                <tbody>
                  <tr><td style={{ padding: '4px 8px', width: '30%' }}><strong>Nome:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Idade:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Sexo:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Escolaridade:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Bairro:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Município:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                </tbody>
              </table>
            </Box>

            <Typography sx={{ fontSize: '13pt', fontWeight: 700, mb: 1.5, color: '#000', textAlign: 'center', textTransform: 'uppercase' }}>
              Roteiro de Perguntas
            </Typography>

            {perguntas.map((p, i) => (
              <Box key={i} sx={{ mb: 2, pb: 1.5, borderBottom: i < perguntas.length - 1 ? '1px dashed #ccc' : 'none' }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '12pt', color: '#000' }}>{i + 1}.</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '12pt', color: '#000' }}>{p.titulo}</Typography>
                </Box>

                {['unica_escolha', 'sim_nao', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral'].includes(p.tipo) && p.opcoes && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    {p.opcoes.map((o, oi) => (
                      <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Box component="span" sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '11pt' }}>{o}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {p.tipo === 'multipla_escolha' && p.opcoes && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    {p.opcoes.map((o, oi) => (
                      <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Box component="span" sx={{ width: 14, height: 14, border: '1.5px solid #555', display: 'inline-block', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '11pt' }}>{o}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {['likert', 'escala_likert'].includes(p.tipo) && p.opcoes && (
                  <Box sx={{ ml: 3, mt: 0.5, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                      <thead>
                        <tr>
                          <td style={{ width: '40%', padding: 4 }}><em>Item</em></td>
                          {p.opcoes.map((o, oi) => (
                            <td key={oi} style={{ textAlign: 'center', padding: 4, borderLeft: '1px solid #ccc' }}>{oi + 1}</td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: 4 }}>{p.titulo}</td>
                          {p.opcoes.map((o, oi) => (
                            <td key={oi} style={{ textAlign: 'center', borderLeft: '1px solid #ccc', padding: 4 }}>
                              <Box component="span" sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </Box>
                )}

                {['numerica', 'nota_0_10', 'escala_avaliacao'].includes(p.tipo) && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    <Typography sx={{ fontSize: '10pt', color: '#666', fontStyle: 'italic' }}>Atribua uma nota de 1 a 10:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <Box key={n} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28 }}>
                          <Box component="span" sx={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                          <Typography sx={{ fontSize: '8pt', mt: 0.25 }}>{n}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {p.tipo === 'ranking' && p.opcoes && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    {p.opcoes.map((o, oi) => (
                      <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Box component="span" sx={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '9pt', fontWeight: 700 }}>{oi + 1}</Box>
                        <Typography sx={{ fontSize: '11pt' }}>{o}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {p.tipo === 'matriz' && p.opcoes && (
                  <Box sx={{ ml: 3, mt: 0.5, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                      <thead>
                        <tr>
                          <td style={{ width: '40%', padding: 4 }}><em>Itens</em></td>
                          {p.opcoes.map((o, oi) => (
                            <td key={oi} style={{ textAlign: 'center', padding: 4, borderLeft: '1px solid #ccc', fontWeight: 700 }}>{o}</td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: 4 }}>{p.titulo}</td>
                          {p.opcoes.map((_, oi) => (
                            <td key={oi} style={{ textAlign: 'center', borderLeft: '1px solid #ccc', padding: 4 }}>
                              <Box component="span" sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #555', display: 'inline-block' }} />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </Box>
                )}

                {['texto_curto', 'texto_longo', 'comentario_aberto', 'texto', 'aberta'].includes(p.tipo) && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    {[1, (p.tipo === 'texto_longo' || p.tipo === 'aberta') ? 5 : 3].map((l) => (
                      <Box key={l} sx={{ borderBottom: '1px solid #999', mb: 0.75, height: (p.tipo === 'texto_longo' || p.tipo === 'aberta') ? 32 : 24 }} />
                    ))}
                    <Typography sx={{ fontSize: '9pt', color: '#999', fontStyle: 'italic' }}>Resposta:</Typography>
                  </Box>
                )}

                {['data'].includes(p.tipo) && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '11pt' }}>___ / ___ / _______</Typography>
                    </Box>
                  </Box>
                )}

                {p.tipo === 'geolocalizacao' && (
                  <Box sx={{ ml: 3, mt: 0.5, display: 'flex', gap: 3 }}>
                    <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: '9pt', color: '#999' }}>Latitude:</Typography><Box sx={{ borderBottom: '1px solid #999', height: 24 }} /></Box>
                    <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: '9pt', color: '#999' }}>Longitude:</Typography><Box sx={{ borderBottom: '1px solid #999', height: 24 }} /></Box>
                  </Box>
                )}

                {!['unica_escolha', 'multipla_escolha', 'sim_nao', 'escala_avaliacao', 'escala_likert', 'nota_0_10', 'ranking', 'matriz', 'texto_curto', 'texto_longo', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral', 'geolocalizacao', 'comentario_aberto', 'likert', 'numerica', 'aberta', 'texto', 'data'].includes(p.tipo) && (
                  <Box sx={{ ml: 3, mt: 0.5 }}>
                    {[1, 2].map((l) => (
                      <Box key={l} sx={{ borderBottom: '1px solid #999', mb: 0.75, height: 24 }} />
                    ))}
                  </Box>
                )}
              </Box>
            ))}

            <Box sx={{ mt: 4, pt: 2, borderTop: '2px solid #000', fontSize: '10pt', color: '#555' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '4px 8px', width: '25%' }}><strong>Entrevistador:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Data:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px' }}>&nbsp;</td></tr>
                  <tr><td style={{ padding: '4px 8px' }}><strong>Observações:</strong></td><td style={{ borderBottom: '1px solid #999', padding: '4px 8px', height: 40 }}>&nbsp;</td></tr>
                </tbody>
              </table>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
