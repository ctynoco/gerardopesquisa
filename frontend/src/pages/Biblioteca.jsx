import { useState } from 'react'
import { Box, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

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
    { titulo: 'Cenário A: Se a eleição fosse entre Julio Cesar e Roberto Pessoa?', tipo: 'unica_escolha', opcoes: ['Julio Cesar', 'Roberto Pessoa', 'Branco/Nulo', 'NS/NR'] },
    { titulo: 'Cenário B: Se a eleição fosse entre Lucinildo Frota e Raphael Pessoa?', tipo: 'unica_escolha', opcoes: ['Lucinildo Frota', 'Raphael Pessoa', 'Branco/Nulo', 'NS/NR'] },
    { titulo: 'Cenário Espontâneo: Em quem votaria? (sem lista)', tipo: 'aberta', opcoes: null },
  ]},
]

export default function Biblioteca() {
  const [busca, setBusca] = useState('')
  const [expanded, setExpanded] = useState('Perfil')

  const filtrados = modelos.map((cat) => ({
    ...cat,
    perguntas: cat.perguntas.filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase())),
  })).filter((cat) => cat.perguntas.length > 0)

  function copiar(p) {
    navigator.clipboard?.writeText(JSON.stringify({ titulo: p.titulo, tipo: p.tipo, opcoes: p.opcoes }, null, 2))
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Biblioteca de Perguntas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{modelos.reduce((s, c) => s + c.perguntas.length, 0)} modelos disponíveis</Typography>

      <TextField
        placeholder="Buscar perguntas..." value={busca} onChange={(e) => setBusca(e.target.value)} size="small" fullWidth
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, '& .MuiInputBase-root': { borderRadius: 2 } }}
      />

      {filtrados.map((cat) => (
        <Accordion key={cat.categoria} expanded={expanded === cat.categoria} onChange={() => setExpanded(expanded === cat.categoria ? '' : cat.categoria)} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>{cat.categoria} <Chip label={cat.perguntas.length} size="small" sx={{ ml: 1 }} /></Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {cat.perguntas.map((p) => (
              <Box key={p.titulo} sx={{ p: 1.5, mb: 1, backgroundColor: 'action.hover', borderRadius: 1.5, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{p.titulo}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={p.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      {p.opcoes && <Chip label={`${p.opcoes.length} opções`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                    </Box>
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copiar(p)} sx={{ fontSize: '0.7rem', py: 0.3, flexShrink: 0 }}>
                    Copiar
                  </Button>
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
