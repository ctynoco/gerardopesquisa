const https = require('https')
const API = process.env.API_URL || 'https://pesquisa-eleitoral-api.onrender.com/api'
const TOTAL = parseInt(process.argv[2]) || 50

function req(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(API + path)
    const body = data ? JSON.stringify(data) : null
    const opts = {
      hostname: u.hostname, port: 443,
      path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    }
    if (token) opts.headers['Authorization'] = 'Bearer ' + token
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body)
    const r = https.request(opts, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }) }
        catch { resolve({ status: res.statusCode, data: d }) }
      })
    })
    r.on('error', reject)
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')) })
    if (body) r.write(body)
    r.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const perguntas = [
  { tipo: 'unica_escolha', titulo: 'Qual sua faixa etária?', opcoes: ['16 a 24 anos', '25 a 34 anos', '35 a 44 anos', '45 a 59 anos', '60 anos ou mais'], ord: 1 },
  { tipo: 'unica_escolha', titulo: 'Gênero', opcoes: ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'], ord: 2 },
  { tipo: 'unica_escolha', titulo: 'Grau de Escolaridade', opcoes: ['Fundamental', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'], ord: 3 },
  { tipo: 'unica_escolha', titulo: 'Renda Familiar', opcoes: ['Até 1 SM', '1 a 2 SM', '2 a 5 SM', '5 a 10 SM', 'Acima de 10 SM'], ord: 4 },
  { tipo: 'unica_escolha', titulo: 'Como avalia a gestão municipal?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe'], ord: 5 },
  { tipo: 'likert', titulo: 'A saúde pública atende bem a população?', opcoes: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'], ord: 6 },
  { tipo: 'likert', titulo: 'A educação municipal tem qualidade?', opcoes: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'], ord: 7 },
  { tipo: 'unica_escolha', titulo: 'Você votaria no atual prefeito para reeleição?', opcoes: ['Sim', 'Não', 'Talvez', 'Não sabe'], ord: 8 },
  { tipo: 'numerica', titulo: 'De 1 a 10, qual nota você dá para a segurança pública?', ord: 9 },
  { tipo: 'multipla_escolha', titulo: 'Quais desses serviços você considera prioritários? (escolha até 3)', opcoes: ['Saúde', 'Educação', 'Segurança', 'Transporte', 'Saneamento', 'Habitação', 'Cultura'], ord: 10 },
  { tipo: 'numerica', titulo: 'De 1 a 10, qual nota você dá para a limpeza urbana?', ord: 11 },
  { tipo: 'aberta', titulo: 'Qual o maior problema da sua cidade hoje?', ord: 12 },
  { tipo: 'aberta', titulo: 'Que sugestão você daria para o próximo prefeito?', ord: 13 },
  { tipo: 'unica_escolha', titulo: 'Você acredita que a situação da cidade vai melhorar nos próximos anos?', opcoes: ['Sim', 'Não', 'Talvez', 'Não sabe'], ord: 14 },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickMulti(arr, max) {
  const n = Math.floor(Math.random() * max) + 1
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
function nota() { return Math.floor(Math.random() * 10) + 1 }
function simNaoProb(p) { return Math.random() < p ? 'Sim' : 'Não' }

const nomes = ['Ana','Bruno','Carla','Diego','Elaine','Felipe','Gabriela','Henrique','Isabela','João','Karina','Lucas','Mariana','Nelson','Olívia','Paulo','Renata','Sergio','Tatiane','Ubirajara','Vanessa','William','Xavier','Yara','Zeca']
const sobrenomes = ['Alves','Barbosa','Costa','Dias','Esteves','Fernandes','Gomes','Hirota','Ishii','Junqueira','Klein','Lima','Mendes','Nunes','Oliveira','Pereira','Quadros','Ribeiro','Santos','Teixeira','Uchoa','Vieira','Xavier','Zanetti']
const problemas = ['Saúde','Segurança','Desemprego','Educação','Transporte','Saneamento','Moradia','Corrupção','Limpeza','Infraestrutura']
const sugestoes = ['Mais hospitais','Escolas em tempo integral','Segurança nas ruas','Transporte público de qualidade','Creches','Pavimentação','Saneamento básico','Empregos','Programas sociais','Mais iluminação']

async function main() {
  console.log(`=== DEMO TESTE: ${TOTAL} entrevistados, ${perguntas.length} perguntas ===`)

  console.log('\n=== LOGIN ===')
  const login = await req('POST', '/auth/login', { telefone: '85999149850', senha: '0102' })
  if (login.status !== 200) { console.log('Login falhou:', login.data?.error || login.data); return }
  const token = login.data.token
  console.log('Login OK')

  console.log('\n=== CRIAR PESQUISA ===')
  const pesq = await req('POST', '/pesquisas', {
    titulo: `Pesquisa Teste ${new Date().toISOString().slice(0, 10)}`,
    descricao: `Pesquisa de teste automatizado com ${perguntas.length} perguntas e ${TOTAL} entrevistados.`,
    margem_erro: 3, nivel_confianca: 95,
    tamanho_amostra: TOTAL, populacao_alvo: 100000,
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  }, token)
  if (pesq.status !== 201) { console.log('Falha ao criar pesquisa:', pesq.data); return }
  const pid = pesq.data.pesquisa?.id || pesq.data?.id
  console.log('Pesquisa ID:', pid)

  console.log('\n=== CRIAR PERGUNTAS ===')
  const pids = []
  for (const p of perguntas) {
    const r = await req('POST', '/perguntas', { ...p, pesquisa_id: pid, opcoes: p.opcoes || null }, token)
    if (r.status === 201) {
      pids.push(r.data.pergunta?.id || r.data?.id)
      console.log(`  Q${p.ord} OK: ${p.titulo.slice(0, 50)}`)
    } else {
      console.log(`  Q${p.ord} FAIL:`, r.data)
    }
    await sleep(200)
  }
  console.log(`${pids.length}/${perguntas.length} perguntas criadas`)

  console.log(`\n=== GERAR ${TOTAL} ENTREVISTADOS ===`)
  for (let i = 1; i <= TOTAL; i++) {
    const nome = pick(nomes) + ' ' + pick(sobrenomes)
    const idade = Math.floor(Math.random() * 60) + 16
    const genero = pick(['Masculino', 'Feminino'])
    const bairro = pick(['Centro', 'Jardim', 'Industrial', 'Vila Nova', 'Santa Clara', 'São José', 'Boa Vista', 'Parque Verde'])
    const escolaridade = pick(['Fundamental', 'Médio Completo', 'Superior Completo', 'Pós-graduação'])
    const renda = pick(['Até 1 SM', '1 a 2 SM', '2 a 5 SM', '5 a 10 SM'])

    const er = await req('POST', '/entrevistados', {
      pesquisa_id: pid, nome, idade, genero, cidade: 'Cidade Teste', estado: 'TT',
      bairro, escolaridade, renda_familiar: renda, consentimento_lgpd: true,
    }, token)
    if (er.status !== 201) { console.log('  FAIL entrevistado', i, er.data?.error?.slice(0, 60)); continue }
    const eid = er.data.entrevistado?.id || er.data?.id
    if (!eid) continue

    const respostas = [
      [pids[0], pick(perguntas[0].opcoes)],
      [pids[1], pick(perguntas[1].opcoes)],
      [pids[2], pick(perguntas[2].opcoes)],
      [pids[3], pick(perguntas[3].opcoes)],
      [pids[4], pick(perguntas[4].opcoes)],
      [pids[5], pick(perguntas[5].opcoes)],
      [pids[6], pick(perguntas[6].opcoes)],
      [pids[7], pick(perguntas[7].opcoes)],
      [pids[8], nota()],
      [pids[9], pickMulti(perguntas[9].opcoes, 3)],
      [pids[10], nota()],
      [pids[11], pick(problemas)],
      [pids[12], pick(sugestoes)],
      [pids[13], pick(perguntas[13].opcoes)],
    ]

    for (const [pp, resposta] of respostas) {
      const r = await req('POST', '/respostas', { pesquisa_id: pid, pergunta_id: pp, entrevistado_id: eid, resposta }, token)
      if (r.status !== 201) console.log(`  R[${i}] pergunta ${pp} FAIL:`, r.data?.error?.slice(0, 50))
    }

    if (i % 10 === 0) console.log(`  ${i}/${TOTAL}`)
    if (i % 50 === 0) await sleep(1000)
  }

  console.log(`\n=== FINALIZAR ===`)
  await req('PUT', '/pesquisas/' + pid, { status: 'ativa' }, token)
  console.log('\nPRONTO! Demo concluída.')
  console.log(`Pesquisa: ${pid}, ${perguntas.length} perguntas, ${TOTAL} entrevistados`)
}

main().catch(console.error)