const express = require('express')
const crypto = require('crypto')
const db = require('../config/database')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.post('/demo/maracanau', authenticate, async (req, res) => {
  try {
    // 1. Criar pesquisa
    const pesq = await db.query(
      `INSERT INTO pesquisas (titulo, descricao, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim, created_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ativa') RETURNING id`,
      ['Pesquisa Eleitoral Municipal - Maracanaú 2026',
       'Pesquisa de intenção de voto e avaliação da gestão municipal para as eleições 2026 em Maracanaú-CE. Margem de erro: 3pp. Nível de confiança: 95%. Amostra: 1200 entrevistas ponderadas.',
       3, 95, 1200, 180000, '2026-05-01', '2026-05-15', req.usuario.id]
    )
    const pid = pesq.rows[0].id

    // 2. Criar perguntas
    const perguntasData = [
      { tipo:'unica_escolha', titulo:'Qual sua idade?', opcoes:['16 a 24 anos','25 a 34 anos','35 a 44 anos','45 a 59 anos','60 anos ou mais'], ord:1 },
      { tipo:'unica_escolha', titulo:'Sexo', opcoes:['Masculino','Feminino','Outro','Prefere não informar'], ord:2 },
      { tipo:'unica_escolha', titulo:'Escolaridade', opcoes:['Ensino Fundamental Incompleto','Ensino Fundamental Completo','Ensino Médio Incompleto','Ensino Médio Completo','Ensino Superior Incompleto','Ensino Superior Completo','Pós-graduação'], ord:3 },
      { tipo:'unica_escolha', titulo:'Faixa de Renda Familiar', opcoes:['Até 1 salário mínimo','De 1 a 2 salários mínimos','De 2 a 5 salários mínimos','De 5 a 10 salários mínimos','Acima de 10 salários mínimos','Não deseja informar'], ord:4 },
      { tipo:'unica_escolha', titulo:'Costuma acompanhar política?', opcoes:['Sim','Não'], ord:5 },
      { tipo:'unica_escolha', titulo:'Participou da última eleição?', opcoes:['Sim','Não'], ord:6 },
      { tipo:'unica_escolha', titulo:'Como avalia a Administração Federal?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:7 },
      { tipo:'unica_escolha', titulo:'Como avalia a Administração Estadual?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:8 },
      { tipo:'unica_escolha', titulo:'Como avalia a Administração Municipal?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:9 },
      { tipo:'aberta', titulo:'Se a eleição fosse hoje, em quem você votaria?', ord:10 },
      { tipo:'unica_escolha', titulo:'Em qual destes candidatos você votaria?', opcoes:['Julio Cesar','Lucinildo Frota','Raphael Pessoa','Roberto Pessoa','Dra. Silvana','Assis da Azevedo','Neton Lacerda','Firmo Camurça','Branco/Nulo','Não sabe / Não opinou'], ord:11 },
      { tipo:'aberta', titulo:'Quem seria sua segunda opção de voto?', ord:12 },
      { tipo:'aberta', titulo:'Você tem rejeição a algum candidato? Qual?', ord:13 },
      { tipo:'unica_escolha', titulo:'Você ainda pode mudar seu voto até a eleição?', opcoes:['Sim','Não'], ord:14 },
      { tipo:'aberta', titulo:'Qual a principal qualidade que você deseja em um candidato?', ord:15 },
      { tipo:'aberta', titulo:'Na sua opinião, quais são os principais problemas da cidade?', ord:16 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Saúde Pública do município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:17 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Educação do município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:18 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Segurança Pública do município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:19 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Limpeza Urbana do município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:20 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Mobilidade Urbana do município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:21 },
      { tipo:'unica_escolha', titulo:'Como você avalia a Transparência da Administração Municipal?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:22 },
      { tipo:'unica_escolha', titulo:'Como você avalia as Obras Públicas realizadas no município?', opcoes:['Ótima','Boa','Regular','Ruim','Péssima','Não sabe / Não opinou'], ord:23 },
      { tipo:'aberta', titulo:'Qual o principal problema que o próximo prefeito deve resolver primeiro?', ord:24 },
      { tipo:'aberta', titulo:'Gostaria de deixar alguma sugestão para melhorar a cidade?', ord:25 },
    ]

    const pids = []
    for (const p of perguntasData) {
      const r = await db.query(
        `INSERT INTO perguntas (pesquisa_id, tipo, titulo, opcoes, ordenacao) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [pid, p.tipo, p.titulo, p.opcoes ? JSON.stringify(p.opcoes) : null, p.ord]
      )
      pids.push(r.rows[0].id)
    }

    // 3. Distribuições ponderadas
    const pick = (dist) => { const r = Math.random(); let acc = 0; for (const d of dist) { acc += d.p; if (r < acc) return d.v } return dist[dist.length-1].v }
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const idades = [{v:'16 a 24 anos',p:0.22},{v:'25 a 34 anos',p:0.28},{v:'35 a 44 anos',p:0.22},{v:'45 a 59 anos',p:0.18},{v:'60 anos ou mais',p:0.10}]
    const generos = [{v:'Masculino',p:0.47},{v:'Feminino',p:0.52},{v:'Outro',p:0.005},{v:'Prefere não informar',p:0.005}]
    const escs = [{v:'Ensino Fundamental Incompleto',p:0.20},{v:'Ensino Fundamental Completo',p:0.15},{v:'Ensino Médio Incompleto',p:0.15},{v:'Ensino Médio Completo',p:0.30},{v:'Ensino Superior Incompleto',p:0.10},{v:'Ensino Superior Completo',p:0.07},{v:'Pós-graduação',p:0.03}]
    const rendas = [{v:'Até 1 salário mínimo',p:0.25},{v:'De 1 a 2 salários mínimos',p:0.30},{v:'De 2 a 5 salários mínimos',p:0.25},{v:'De 5 a 10 salários mínimos',p:0.10},{v:'Acima de 10 salários mínimos',p:0.03},{v:'Não deseja informar',p:0.07}]

    const nomesM = ['Francisco','José','Antônio','João','Carlos','Raimundo','Luis','Miguel','Pedro','Paulo','Marcos','Fernando','Jorge','Eduardo','Ricardo','Manoel','Claudio','Ronaldo','Felipe','André','Rafael','Gabriel','Lucas','Bruno','Daniel','Fábio','Rodrigo','Marcelo','Thiago','Diego','Vinícius','Alex','Cristiano','Leandro','Sérgio','Wagner','Adriano','Leonardo','Davi','Vitor']
    const nomesF = ['Maria','Francisca','Ana','Raimunda','Antônia','Joana','Tereza','Luciana','Cristina','Marta','Sônia','Rita','Lúcia','Cláudia','Rosa','Sandra','Juliana','Patrícia','Fernanda','Camila','Amanda','Letícia','Jessica','Viviane','Bianca','Larissa','Mariana','Isabela','Nathalia','Aline','Vanessa','Priscila','Débora','Tamires','Carla','Elaine','Daniele','Simone','Alessandra','Tatiane']
    const sobrenomes = ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Almeida','Nascimento','Ferreira','Araújo','Ribeiro','Carvalho','Gomes','Martins','Barbosa','Rodrigues','Alves','Melo','Barros','Vieira','Monteiro','Lopes','Dias','Cavalcante','Moreira','Bezerra','Castro','Correia','Mendes','Azevedo','Freitas','Cardoso','Maia','Sá','Xavier','Bastos','Muniz','Chaves','Reis']

    const cand = ['Julio Cesar','Lucinildo Frota','Raphael Pessoa','Roberto Pessoa','Dra. Silvana','Assis da Azevedo','Neton Lacerda','Firmo Camurça','Branco/Nulo','Não sabe / Não opinou']
    const pesosVoto = [0.18,0.12,0.10,0.15,0.08,0.06,0.05,0.04,0.12,0.10]
    function voto() { const r=Math.random();let a=0;for(let i=0;i<cand.length;i++){a+=pesosVoto[i];if(r<a)return cand[i]}return cand[9] }
    function segOpcao(v) { const o=cand.filter(c=>c!==v&&c!=='Branco/Nulo'&&c!=='Não sabe / Não opinou');return [...o,'Branco/Nulo','Não sabe / Não opinou'][Math.floor(Math.random()*(o.length+2))] }
    function rejeicao(v) { if(Math.random()<0.4)return'Nenhum';const o=cand.filter(c=>c!==v&&c!=='Branco/Nulo'&&c!=='Não sabe / Não opinou');return o[Math.floor(Math.random()*o.length)] }
    function aval(r1,r2,r3,r4) { const r=Math.random();if(r<r1)return'Ótima';if(r<r2)return'Boa';if(r<r3)return'Regular';if(r<r4)return'Ruim';return'Péssima' }
    const problemas = ['Saúde','Segurança','Educação','Saneamento básico','Desemprego','Transporte público','Infraestrutura','Saúde e Educação','Limpeza urbana','Qualidade de vida']
    const qualidades = ['Honestidade','Trabalho','Compromisso','Experiência','Honestidade e trabalho','Responsabilidade','Competência','Humildade','Caráter','Saber ouvir o povo']
    const sugestoes = ['Melhorar o atendimento nos postos de saúde','Mais segurança nas ruas','Creches em tempo integral','Pavimentação de ruas','Mais empregos','Melhorar o transporte público','Construção de hospital','Mais escolas técnicas','Programas sociais mais efetivos','Saneamento para todos os bairros']

    console.log('Gerando 1200 entrevistados...')
    for (let i = 1; i <= 1200; i++) {
      const idade = pick(idades)
      const genero = pick(generos)
      const escolaridade = pick(escs)
      const renda = pick(rendas)
      const nb = (genero === 'Feminino' || genero === 'Outro') ? nomesF : nomesM
      const nome = nb[i % nb.length] + ' ' + sobrenomes[i % sobrenomes.length] + ' ' + sobrenomes[(i + 3) % sobrenomes.length]
      const idadeNum = idade === '16 a 24 anos' ? rand(16,24) : idade === '25 a 34 anos' ? rand(25,34) : idade === '35 a 44 anos' ? rand(35,44) : idade === '45 a 59 anos' ? rand(45,59) : rand(60,85)
      const v = voto()
      const token = crypto.randomBytes(16).toString('hex')

      // Batch insert entrevistado
      const e = await db.query(
        `INSERT INTO entrevistados (pesquisa_id,nome,idade,genero,cidade,estado,escolaridade,renda_familiar,consentimento_lgpd,token_anonimizacao)
         VALUES ($1,$2,$3,$4,'Maracanaú','CE',$5,$6,true,$7) RETURNING id`,
        [pid, nome, idadeNum, genero, escolaridade, renda, token]
      )
      const eid = e.rows[0].id

      // Batch insert all 25 respostas
      const respostas = [
        [pids[0], idade], [pids[1], genero], [pids[2], escolaridade], [pids[3], renda],
        [pids[4], Math.random()<0.55?'Sim':'Não'], [pids[5], Math.random()<0.72?'Sim':'Não'],
        [pids[6], aval(0.03,0.12,0.35,0.55)], [pids[7], aval(0.04,0.15,0.40,0.60)], [pids[8], aval(0.02,0.10,0.40,0.70)],
        [pids[9], v], [pids[10], v],
        [pids[11], segOpcao(v)], [pids[12], rejeicao(v)],
        [pids[13], Math.random()<0.38?'Sim':'Não'], [pids[14], qualidades[Math.floor(Math.random()*qualidades.length)]],
        [pids[15], problemas[Math.floor(Math.random()*problemas.length)]],
        [pids[16], aval(0.01,0.05,0.20,0.45)], [pids[17], aval(0.03,0.15,0.45,0.65)], [pids[18], aval(0.02,0.10,0.40,0.70)],
        [pids[19], aval(0.01,0.05,0.15,0.40)], [pids[20], aval(0.02,0.08,0.25,0.55)],
        [pids[21], aval(0.01,0.08,0.30,0.55)], [pids[22], aval(0.03,0.12,0.35,0.50)],
        [pids[23], sugestoes[Math.floor(Math.random()*sugestoes.length)]],
        [pids[24], sugestoes[Math.floor(Math.random()*sugestoes.length)]],
      ]

      // Bulk insert respostas
      const values = respostas.map((_, idx) => `($1,$${idx*3+2},$${idx*3+3},$${idx*3+4})`).join(',')
      const flatParams = [pid]
      for (const [pp, r] of respostas) { flatParams.push(pp, eid, JSON.stringify(r)) }

      await db.query(
        `INSERT INTO respostas (pesquisa_id, pergunta_id, entrevistado_id, resposta) VALUES ${values}
         ON CONFLICT (pergunta_id, entrevistado_id) DO NOTHING`,
        flatParams
      )

      if (i % 200 === 0) console.log(`  ${i}/1200 entrevistados`)
    }

    res.json({ success: true, pesquisa_id: pid, message: '1200 entrevistas geradas com sucesso!' })
  } catch (err) {
    console.error('Demo error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
