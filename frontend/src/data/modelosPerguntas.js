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

export default modelos
