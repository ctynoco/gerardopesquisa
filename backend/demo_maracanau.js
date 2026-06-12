const https = require('https')
const API = 'https://pesquisa-eleitoral-api.onrender.com/api'

function req(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(API + path)
    const body = data ? JSON.stringify(data) : null
    const opts = {
      hostname: u.hostname, port: 443,
      path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
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

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('=== ACORDANDO RENDER ===')
  await req('GET', '/health', null, null)
  await sleep(3000)

  console.log('=== LOGIN ===')
  const login = await req('POST', '/auth/login', { telefone: '85999149850', senha: '0102' })
  if (login.status !== 200) { console.log('Login failed:', login.data); return }
  const token = login.data.token
  console.log('Login OK')

  console.log('\n=== CRIAR PESQUISA ===')
  const pesq = await req('POST', '/pesquisas', {
    titulo: 'Pesquisa Eleitoral Municipal - Maracanaú 2026',
    descricao: 'Pesquisa de intenção de voto e avaliação da gestão municipal para as eleições 2026 em Maracanaú-CE. Margem de erro: 3pp. Nível de confiança: 95%. Amostra: 1200 entrevistas ponderadas.',
    margem_erro: 3, nivel_confianca: 95,
    tamanho_amostra: 1200, populacao_alvo: 180000,
    data_inicio: '2026-05-01', data_fim: '2026-05-15',
  }, token)
  if (pesq.status !== 201) { console.log('Failed:', pesq.data); return }
  const pid = pesq.data.pesquisa.id
  console.log('Pesquisa ID:', pid)

   console.log('\n=== CRIAR PERGUNTAS ===')
  const perguntas = [
    { tipo: 'unica_escolha', titulo: 'Costuma acompanhar política?', opcoes: ['Sim', 'Não'], ordenacao: 1 },
    { tipo: 'unica_escolha', titulo: 'Participou da última eleição?', opcoes: ['Sim', 'Não'], ordenacao: 2 },
    { tipo: 'unica_escolha', titulo: 'Como avalia a Administração Federal?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 3 },
    { tipo: 'unica_escolha', titulo: 'Como avalia a Administração Estadual?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 4 },
    { tipo: 'unica_escolha', titulo: 'Como avalia a Administração Municipal?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 5 },
    { tipo: 'aberta', titulo: 'Se a eleição fosse hoje, em quem você votaria?', ordenacao: 6 },
    { tipo: 'unica_escolha', titulo: 'Em qual destes candidatos você votaria?', opcoes: ['Julio Cesar', 'Lucinildo Frota', 'Raphael Pessoa', 'Roberto Pessoa', 'Dra. Silvana', 'Assis da Azevedo', 'Neton Lacerda', 'Firmo Camurça', 'Branco/Nulo', 'Não sabe / Não opinou'], ordenacao: 7 },
    { tipo: 'aberta', titulo: 'Quem seria sua segunda opção de voto?', ordenacao: 8 },
    { tipo: 'aberta', titulo: 'Você tem rejeição a algum candidato? Qual?', ordenacao: 9 },
    { tipo: 'unica_escolha', titulo: 'Você ainda pode mudar seu voto até a eleição?', opcoes: ['Sim', 'Não'], ordenacao: 10 },
    { tipo: 'aberta', titulo: 'Qual a principal qualidade que você deseja em um candidato?', ordenacao: 11 },
    { tipo: 'aberta', titulo: 'Na sua opinião, quais são os principais problemas da cidade?', ordenacao: 12 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Saúde Pública do município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 13 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Educação do município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 14 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Segurança Pública do município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 15 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Limpeza Urbana do município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 16 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Mobilidade Urbana do município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 17 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia a Transparência da Administração Municipal?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 18 },
    { tipo: 'unica_escolha', titulo: 'Como você avalia as Obras Públicas realizadas no município?', opcoes: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não sabe / Não opinou'], ordenacao: 19 },
    { tipo: 'aberta', titulo: 'Qual o principal problema que o próximo prefeito deve resolver primeiro?', ordenacao: 20 },
    { tipo: 'aberta', titulo: 'Gostaria de deixar alguma sugestão para melhorar a cidade?', ordenacao: 21 },
  ]

  const pids = []
  for (const p of perguntas) {
    const r = await req('POST', '/perguntas', { ...p, pesquisa_id: pid, opcoes: p.opcoes || null }, token)
    if (r.status === 201) {
      pids.push(r.data.pergunta.id)
      console.log('  Q' + p.ordenacao + ' ID:', r.data.pergunta.id)
    } else console.log('  FAIL Q' + p.ordenacao + ':', r.data)
    await sleep(200)
  }

  console.log('\n=== DISTRIBUICAO DEMOGRAFICA ===')
  const idades = [
    { v: '16 a 24 anos', p: 0.22 }, { v: '25 a 34 anos', p: 0.28 },
    { v: '35 a 44 anos', p: 0.22 }, { v: '45 a 59 anos', p: 0.18 },
    { v: '60 anos ou mais', p: 0.10 },
  ]
  const generos = [
    { v: 'Masculino', p: 0.47 }, { v: 'Feminino', p: 0.52 },
    { v: 'Outro', p: 0.005 }, { v: 'Prefere não informar', p: 0.005 },
  ]
  const escolaridades = [
    { v: 'Ensino Fundamental Incompleto', p: 0.20 }, { v: 'Ensino Fundamental Completo', p: 0.15 },
    { v: 'Ensino Médio Incompleto', p: 0.15 }, { v: 'Ensino Médio Completo', p: 0.30 },
    { v: 'Ensino Superior Incompleto', p: 0.10 }, { v: 'Ensino Superior Completo', p: 0.07 },
    { v: 'Pós-graduação', p: 0.03 },
  ]
  const rendas = [
    { v: 'Até 1 salário mínimo', p: 0.25 }, { v: 'De 1 a 2 salários mínimos', p: 0.30 },
    { v: 'De 2 a 5 salários mínimos', p: 0.25 }, { v: 'De 5 a 10 salários mínimos', p: 0.10 },
    { v: 'Acima de 10 salários mínimos', p: 0.03 }, { v: 'Não deseja informar', p: 0.07 },
  ]

  function pick(dist) { const r = Math.random(); let acc = 0; for (const d of dist) { acc += d.p; if (r < acc) return d.v } return dist[dist.length - 1].v }

  const nomesM = ['Francisco','José','Antônio','João','Carlos','Raimundo','Luis','Miguel','Pedro','Paulo','Marcos','Fernando','Jorge','Eduardo','Ricardo','Manoel','Claudio','Ronaldo','Felipe','André','Rafael','Gabriel','Lucas','Bruno','Daniel','Fábio','Rodrigo','Marcelo','Thiago','Diego','Vinícius','Alex','Cristiano','Leandro','Sérgio','Wagner','Adriano','Leonardo','Davi','Vitor']
  const nomesF = ['Maria','Francisca','Ana','Raimunda','Antônia','Joana','Tereza','Luciana','Cristina','Marta','Sônia','Rita','Lúcia','Cláudia','Rosa','Sandra','Juliana','Patrícia','Fernanda','Camila','Amanda','Letícia','Jessica','Viviane','Bianca','Larissa','Mariana','Isabela','Nathalia','Aline','Vanessa','Priscila','Débora','Tamires','Carla','Elaine','Daniele','Simone','Alessandra','Tatiane']
  const sobrenomes = ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Almeida','Nascimento','Ferreira','Araújo','Ribeiro','Carvalho','Gomes','Martins','Barbosa','Rodrigues','Alves','Melo','Barros','Vieira','Monteiro','Lopes','Dias','Cavalcante','Moreira','Bezerra','Castro','Correia','Mendes','Azevedo','Freitas','Cardoso','Maia','Sá','Xavier','Bastos','Muniz','Chaves','Reis']

  const bairros = ['Centro','Conjunto Industrial','Jereissati I','Jereissati II','Pajuçara','Alto da Mangueira','Novo Maracanaú','Mucunã','Pirangi','Sapupara','Siqueira','Timbó','Vila São João','Boqueirão','São Miguel']

  const candidatos = ['Julio Cesar','Lucinildo Frota','Raphael Pessoa','Roberto Pessoa','Dra. Silvana','Assis da Azevedo','Neton Lacerda','Firmo Camurça','Branco/Nulo','Não sabe / Não opinou']
  const pesosVoto = [0.18, 0.12, 0.10, 0.15, 0.08, 0.06, 0.05, 0.04, 0.12, 0.10]
  function pickVoto() { const r = Math.random(); let acc = 0; for (let i = 0; i < candidatos.length; i++) { acc += pesosVoto[i]; if (r < acc) return candidatos[i] } return 'Não sabe / Não opinou' }

  function pickVotoEspontaneo() {
    const espontaneo = [...candidatos, 'Não sei', 'Prefiro não responder', 'Ninguém']
    const pesos = [0.14, 0.09, 0.08, 0.12, 0.06, 0.04, 0.03, 0.02, 0.08, 0.10, 0.14, 0.05, 0.05]
    const r = Math.random(); let acc = 0
    for (let i = 0; i < espontaneo.length; i++) { acc += pesos[i]; if (r < acc) return espontaneo[i] }
    return 'Não sei'
  }

  function pickSegunda(v) { const o = candidatos.filter(c => c !== v && c !== 'Branco/Nulo' && c !== 'Não sabe / Não opinou'); const t = [...o, 'Branco/Nulo', 'Não sabe / Não opinou']; return t[Math.floor(Math.random()*t.length)] }
  function pickRejeicao(v) { if (Math.random() < 0.4) return 'Nenhum'; const o = candidatos.filter(c => c !== v && c !== 'Branco/Nulo' && c !== 'Não sabe / Não opinou'); return o[Math.floor(Math.random()*o.length)] }

  function avalMunicipal() { const r = Math.random(); if (r<0.02) return 'Ótima'; if (r<0.10) return 'Boa'; if (r<0.40) return 'Regular'; if (r<0.70) return 'Ruim'; return 'Péssima' }
  function avalFederal() { const r = Math.random(); if (r<0.03) return 'Ótima'; if (r<0.12) return 'Boa'; if (r<0.35) return 'Regular'; if (r<0.55) return 'Ruim'; return 'Péssima' }
  function avalEstadual() { const r = Math.random(); if (r<0.04) return 'Ótima'; if (r<0.15) return 'Boa'; if (r<0.40) return 'Regular'; if (r<0.60) return 'Ruim'; return 'Péssima' }
  function saude() { const r = Math.random(); if (r<0.01) return 'Ótima'; if (r<0.05) return 'Boa'; if (r<0.20) return 'Regular'; if (r<0.45) return 'Ruim'; return 'Péssima' }
  function educacao() { const r = Math.random(); if (r<0.03) return 'Ótima'; if (r<0.15) return 'Boa'; if (r<0.45) return 'Regular'; if (r<0.65) return 'Ruim'; return 'Péssima' }
  function seguranca() { const r = Math.random(); if (r<0.01) return 'Ótima'; if (r<0.04) return 'Boa'; if (r<0.15) return 'Regular'; if (r<0.45) return 'Ruim'; return 'Péssima' }
  function limpeza() { const r = Math.random(); if (r<0.01) return 'Ótima'; if (r<0.05) return 'Boa'; if (r<0.15) return 'Regular'; if (r<0.40) return 'Ruim'; return 'Péssima' }
  function mobilidade() { const r = Math.random(); if (r<0.02) return 'Ótima'; if (r<0.08) return 'Boa'; if (r<0.25) return 'Regular'; if (r<0.55) return 'Ruim'; return 'Péssima' }
  function transparencia() { const r = Math.random(); if (r<0.01) return 'Ótima'; if (r<0.08) return 'Boa'; if (r<0.30) return 'Regular'; if (r<0.55) return 'Ruim'; return 'Péssima' }
  function obras() { const r = Math.random(); if (r<0.03) return 'Ótima'; if (r<0.12) return 'Boa'; if (r<0.35) return 'Regular'; if (r<0.50) return 'Ruim'; return 'Péssima' }

  const problemas = ['Saúde','Segurança','Educação','Saneamento básico','Desemprego','Transporte público','Infraestrutura','Saúde e Educação','Limpeza urbana','Qualidade de vida']
  const qualidades = ['Honestidade','Trabalho','Compromisso','Experiência','Honestidade e trabalho','Responsabilidade','Competência','Humildade','Caráter','Saber ouvir o povo']
  const sugestoes = ['Melhorar o atendimento nos postos de saúde','Mais segurança nas ruas','Creches em tempo integral','Pavimentação de ruas','Mais empregos para a juventude','Melhorar o transporte público','Construção de hospital','Mais escolas técnicas','Programas sociais mais efetivos','Saneamento para todos os bairros']
  function abrir(arr) { return arr[Math.floor(Math.random()*arr.length)] }

  console.log('Gerando 1200 entrevistados...')
  for (let i = 1; i <= 1200; i++) {
    const idade = pick(idades)
    const genero = pick(generos)
    const escolaridade = pick(escolaridades)
    const renda = pick(rendas)
    const bairro = bairros[i % bairros.length]
    const nomeBase = (genero === 'Feminino' || genero === 'Outro') ? nomesF : nomesM
    const nome = nomeBase[i % nomeBase.length] + ' ' + sobrenomes[i % sobrenomes.length] + ' ' + sobrenomes[(i + 3) % sobrenomes.length]
    const idadeNum = idade === '16 a 24 anos' ? Math.floor(Math.random()*9+16) : idade === '25 a 34 anos' ? Math.floor(Math.random()*10+25) : idade === '35 a 44 anos' ? Math.floor(Math.random()*10+35) : idade === '45 a 59 anos' ? Math.floor(Math.random()*15+45) : Math.floor(Math.random()*20+60)
    const voto = pickVoto()
    const votoEsp = pickVotoEspontaneo()

    const er = await req('POST', '/entrevistados', {
      pesquisa_id: pid, nome, idade: idadeNum, genero, cidade: 'Maracanaú', estado: 'CE',
      bairro, escolaridade, renda_familiar: renda, consentimento_lgpd: true
    }, token)
    if (er.status !== 201) { console.log('  FAIL entrevistado', i, er.data); continue }
    const eid = er.data.entrevistado.id

    const respostas = [
      [pids[0], Math.random()<0.55?'Sim':'Não'], [pids[1], Math.random()<0.72?'Sim':'Não'],
      [pids[2], avalFederal()], [pids[3], avalEstadual()], [pids[4], avalMunicipal()],
      [pids[5], votoEsp], [pids[6], voto],
      [pids[7], pickSegunda(voto)], [pids[8], pickRejeicao(voto)],
      [pids[9], Math.random()<0.38?'Sim':'Não'], [pids[10], abrir(qualidades)],
      [pids[11], abrir(problemas)],
      [pids[12], saude()], [pids[13], educacao()], [pids[14], seguranca()],
      [pids[15], limpeza()], [pids[16], mobilidade()],
      [pids[17], transparencia()], [pids[18], obras()],
      [pids[19], abrir(sugestoes)], [pids[20], abrir(sugestoes)],
    ]
    for (const [pp, resposta] of respostas) {
      await req('POST', '/respostas', { pesquisa_id: pid, pergunta_id: pp, entrevistado_id: eid, resposta }, token)
    }

    if (i % 50 === 0) console.log('  ' + i + '/1200')
    if (i % 100 === 0) await sleep(1000) // pausa a cada 100 para não sobrecarregar
  }

  console.log('\n=== FINALIZAR ===')
  await req('PUT', '/pesquisas/' + pid, { status: 'ativa' }, token)
  console.log('Pesquisa finalizada como ATIVA')
  console.log('\nPRONTO! 1200 entrevistas com respostas completas.')
  console.log('Acesse https://gerardopesquisa.vercel.app')
}

main().catch(console.error)
