import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Paper, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Grid, Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import api from '../services/api'

const tipos = [
  { value: 'unica_escolha', label: 'Única Escolha' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'likert', label: 'Escala 1-5' },
  { value: 'numerica', label: 'Escala 1-10' },
]

const modelos = [
  { categoria: 'Perfil', perguntas: [
    { titulo: 'Idade', tipo: 'unica_escolha', opcoes: ['16 a 24 anos', '25 a 34 anos', '35 a 44 anos', '45 a 59 anos', '60 anos ou mais'] },
    { titulo: 'Sexo', tipo: 'unica_escolha', opcoes: ['Masculino', 'Feminino', 'Outro', 'Prefere não informar'] },
    { titulo: 'Escolaridade', tipo: 'unica_escolha', opcoes: ['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'] },
    { titulo: 'Renda Familiar', tipo: 'unica_escolha', opcoes: ['Até 1 SM', '1 a 2 SM', '2 a 5 SM', '5 a 10 SM', 'Acima de 10 SM', 'Não informa'] },
  ]},
  { categoria: 'Política', perguntas: [
    { titulo: 'Costuma acompanhar política?', tipo: 'unica_escolha', opcoes: ['Sim', 'Não'] },
    { titulo: 'Participou da última eleição?', tipo: 'unica_escolha', opcoes: ['Sim', 'Não'] },
    { titulo: 'Como avalia a administração federal?', tipo: 'unica_escolha', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'NS/NR'] },
    { titulo: 'Como avalia a administração estadual?', tipo: 'unica_escolha', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'NS/NR'] },
    { titulo: 'Como avalia a administração municipal?', tipo: 'unica_escolha', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'NS/NR'] },
  ]},
  { categoria: 'Intenção de Voto', perguntas: [
    { titulo: 'Se a eleição fosse hoje, em quem votaria?', tipo: 'unica_escolha', opcoes: ['Julio Cesar', 'Lucinildo Frota', 'Raphael Pessoa', 'Roberto Pessoa', 'Dra. Silvana', 'Assis da Azevedo', 'Neton Lacerda', 'Firmo Camurça', 'Branco/Nulo', 'NS/NR'] },
    { titulo: 'Segunda opção de voto?', tipo: 'aberta', opcoes: null },
    { titulo: 'Voto definido?', tipo: 'unica_escolha', opcoes: ['Sim', 'Não'] },
    { titulo: 'Poderia mudar de voto?', tipo: 'unica_escolha', opcoes: ['Sim', 'Não'] },
  ]},
  { categoria: 'Rejeição', perguntas: [
    { titulo: 'Em quem não votaria de jeito nenhum?', tipo: 'unica_escolha', opcoes: ['Julio Cesar', 'Lucinildo Frota', 'Raphael Pessoa', 'Roberto Pessoa', 'Dra. Silvana', 'Assis da Azevedo', 'Neton Lacerda', 'Firmo Camurça', 'Nenhum', 'NS/NR'] },
    { titulo: 'Qual candidato rejeita mais?', tipo: 'aberta', opcoes: null },
  ]},
  { categoria: 'Prioridades', perguntas: [
    { titulo: 'Qual o principal problema na área da Saúde?', tipo: 'aberta', opcoes: null },
    { titulo: 'Qual o principal problema na área da Educação?', tipo: 'aberta', opcoes: null },
    { titulo: 'Como avalia a Segurança Pública?', tipo: 'unica_escolha', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'NS/NR'] },
    { titulo: 'Qual a maior prioridade para geração de emprego?', tipo: 'aberta', opcoes: null },
  ]},
  { categoria: 'Cenários', perguntas: [
    { titulo: 'Cenário A: Julio Cesar vs Roberto Pessoa?', tipo: 'unica_escolha', opcoes: ['Julio Cesar', 'Roberto Pessoa', 'Branco/Nulo', 'NS/NR'] },
    { titulo: 'Cenário B: Lucinildo Frota vs Raphael Pessoa?', tipo: 'unica_escolha', opcoes: ['Lucinildo Frota', 'Raphael Pessoa', 'Branco/Nulo', 'NS/NR'] },
    { titulo: 'Cenário Espontâneo: Em quem votaria?', tipo: 'aberta', opcoes: null },
  ]},
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

  async function adicionar(pp) {
    const p = pp || editando
    if (!p.titulo.trim()) return
    const nova = { titulo: p.titulo, tipo: p.tipo }
    if (p.opcoes?.length) nova.opcoes = p.opcoes
    else if (typeof p.opcoes === 'string' && p.opcoes.trim()) nova.opcoes = p.opcoes.split(',').map((s) => s.trim())
    setPerguntas((prev) => [...prev, { ...nova, _salva: false, _id: null }])
    if (!pp) setEditando({ titulo: '', tipo: 'unica_escolha', opcoes: '' })
  }

  function remover(idx) {
    setPerguntas((prev) => prev.filter((_, i) => i !== idx))
  }

  async function salvarUma(pp, idx) {
    if (!pesquisaId && !nome.trim()) return alert('Informe o nome do questionário primeiro')
    let pid = pesquisaId
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
  }

  async function excluirUma(pp, idx) {
    if (pp._id) await api.delete(`/perguntas/${pp._id}`).catch(() => {})
    setPerguntas((prev) => prev.filter((_, i) => i !== idx))
  }

  async function salvarQuestionario() {
    if (!nome.trim()) return alert('Informe o nome do questionário')
    let pid = pesquisaId
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
        try {
          const r = await api.post('/perguntas', { pesquisa_id: pid, titulo: p.titulo, tipo: p.tipo, opcoes: p.opcoes || null, ordenacao: i + 1 })
          const saved = r.data?.pergunta || r.data
          p._salva = true; p._id = saved.id
        } catch {}
      }
    }
    alert(`Questionário salvo! ID: ${pid}`)
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
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Criar Questionário</Typography>

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

          <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Perguntas ({perguntas.length})</Typography>

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
                  {(editando.tipo === 'unica_escolha' || editando.tipo === 'multipla_escolha') && (
                    <TextField label="Opções (separadas por ,)" value={editando.opcoes} onChange={(e) => setEditando({ ...editando, opcoes: e.target.value })} size="small" fullWidth />
                  )}
                </Grid>
              </Grid>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => adicionar()} disabled={!editando.titulo.trim()} sx={{ borderRadius: 2 }}>
                Adicionar Pergunta
              </Button>
            </Box>
          </Paper>

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
            <Button variant="contained" startIcon={<SaveIcon />} onClick={salvarQuestionario} fullWidth sx={{ mt: 2, py: 1.5, borderRadius: 2 }}>
              Salvar Questionário Completo
            </Button>
          )}
        </Grid>

        {/* Coluna Direita — Biblioteca */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'sticky', top: 16 }}>
            <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>
              Biblioteca de Perguntas ({modelos.reduce((s, c) => s + c.perguntas.length, 0)})
            </Typography>
            <TextField
              placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} size="small" fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ mb: 1.5, '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
