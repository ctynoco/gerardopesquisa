# PESQUISA ELEITORAL PRO - STATUS DO PROJETO

---

## 1. INFORMAÇÕES GERAIS

| Item | Detalhe |
|------|---------|
| **Nome do Projeto** | Pesquisa Eleitoral PRO |
| **Data de Início** | 09/06/2026 |
| **Última Atualização** | 10/06/2026 |
| **Status Geral** | 🚧 Em desenvolvimento |
| **Responsável** | - |

---

## 2. ONDE PARAMOS

**Fase atual:** Nenhuma. Projeto acabou de ser concebido.

**Última ação realizada:** Preparação para deploy (Vercel + Render).

**Próxima ação planejada:** -

---

## 3. O QUE JÁ FOI FEITO

- [x] Definição dos módulos principais (Dashboard, Cadastro, Biblioteca, Coleta, Relatórios, Admin)
- [x] Questionário inicial de 32 perguntas (Perfil, Interesse, Avaliação, Intenção de Voto)
- [x] Estrutura inicial do banco de dados (4 tabelas: pesquisas, perguntas, respostas, entrevistados)
- [x] Layout base do dashboard e editor visual de perguntas
- [x] Escolha de tecnologias (React, Node.js, PostgreSQL, Chart.js, Leaflet, PDFMake, JWT)
- [x] Documento de status criado (este arquivo)

---

## 4. O QUE FALTA FAZER

### FASE 1 - FUNDAÇÃO (Prioridade Máxima)
- [x] Criar estrutura de diretórios do projeto (frontend + backend)
- [x] Configurar ambiente de desenvolvimento
- [x] Inicializar projeto Node.js/React
- [x] Configurar banco de dados PostgreSQL
- [x] Criar migrations completas (todas as tabelas)
- [x] Configurar autenticação JWT
- [x] Middleware de segurança (LGPD, auditoria)

### FASE 2 - BACKEND (API)
- [x] CRUD de Pesquisas
- [x] CRUD de Perguntas (7 tipos)
- [x] CRUD de Entrevistados
- [x] CRUD de Respostas
- [x] Estatísticas e cálculos (margem de erro, nível de confiança)
- [x] Cruzamento de dados
- [x] Exportação (PDF, Excel, CSV, JSON)
- [x] API REST documentada

### FASE 3 - FRONTEND
- [x] Layout base (sidebar + header + conteúdo)
- [x] Dashboard completo
- [x] Cadastro de Pesquisas
- [x] Biblioteca de Perguntas (editor visual)
- [x] Coleta (interface tablet/mobile)
- [x] Relatórios (visualização + exportação)
- [x] Administração (usuários, permissões, auditoria)

### FASE 4 - GRÁFICOS E MAPAS
- [x] Gráficos de pizza, barra, linha (Chart.js)
- [x] Mapa geográfico (Leaflet)
- [x] Dashboard interativo com filtros

### FASE 5 - TESTES E IMPLANTAÇÃO
- [x] Testes unitários e integração (80 testes backend + 12 testes frontend)
- [x] Correção de bugs (CSV exportação - chave de perguntas)
- [ ] Deploy (configurado - aguardando execução)

---

## 5. DECISÕES TÉCNICAS

| Decisão | Opção Escolhida | Alternativas |
|---------|----------------|--------------|
| Frontend | React + HTML5/CSS3/JS | Vue, Angular |
| Backend | Node.js + Express | Django, Laravel |
| Banco | PostgreSQL | MySQL, SQLite |
| Gráficos | Chart.js | D3.js, Recharts |
| Mapas | Leaflet | Google Maps, Mapbox |
| Relatórios PDF | PDFMake | jsPDF, Puppeteer |
| Autenticação | JWT | OAuth, Sessions |

---

## 6. PONTOS DE ATENÇÃO / RISCOS

- [ ] **Tamanho do questionário:** 32 perguntas pode tornar a coleta longa para entrevistas presenciais
- [ ] **Coleta offline:** Necessário suporte para tablet/celular sem internet
- [ ] **Margem de erro:** Implementar cálculo estatístico correto desde o início
- [ ] **LGPD:** Garantir anonimização e consentimento dos entrevistados
- [ ] **Escalabilidade:** PostgreSQL precisa de índices bem planejados
- [ ] **Sincronização:** Dados coletados offline precisam sincronizar quando houver conexão

---

## 7. ERROS COMUNS A EVITAR

1. **Misturar frontend e backend no mesmo diretório** → Manter `/frontend` e `/backend` separados
2. **Banco sem migrations** → Usar migrations desde o dia 1
3. **Esquecer tratamento de erros na API** → Middleware global de erros
4. **Não validar entrada do usuário** → Validação no frontend e no backend
5. **Gráficos sem responsividade** → Testar em todos os tamanhos de tela
6. **Ausência de paginação** → Rotas da API devem paginar resultados
7. **Não tratar coleta offline** → Implementar Service Worker ou cache local
8. **Senhas e tokens hardcoded** → Usar variáveis de ambiente (.env)

---

## 8. LOG DE ALTERAÇÕES

| Data | O que foi feito | Status |
|------|----------------|--------|
| 09/06/2026 | Criação do documento de status | ✅ |
| 10/06/2026 | Estrutura de pastas criada (frontend + backend) | ✅ |
| 10/06/2026 | Projetos inicializados (Vite React + Express) | ✅ |
| 10/06/2026 | Dependências instaladas (frontend + backend) | ✅ |
| 10/06/2026 | Banco PostgreSQL configurado e migrations executadas | ✅ |
| 10/06/2026 | Autenticação JWT + middlewares (auth, audit, error) | ✅ |
| 10/06/2026 | CRUD completo API (Pesquisas, Perguntas, Entrevistados, Respostas, Estatísticas) | ✅ |
| 10/06/2026 | Frontend completo (layout, dashboard, páginas, coleta, relatórios) | ✅ |
| 10/06/2026 | Exportação (PDF/Excel/CSV/JSON), Admin (usuários+auditoria), Mapa Leaflet | ✅ |
| 10/06/2026 | Configuração de deploy (Vercel frontend + Render backend) | ✅ |
| 10/06/2026 | Testes backend criados (80 testes: Jest + Supertest) | ✅ |
| 10/06/2026 | Testes frontend criados (12 testes: Vitest + Testing Library) | ✅ |
| 10/06/2026 | Bugfix: exportação CSV (chave de perguntas não mapeada) | ✅ |
| 10/06/2026 | Login alterado de email para telefone | ✅ |
| 10/06/2026 | Seed admin: (85) 996962828 / 2314@# | ✅ |

---

*Última análise completa: 09/06/2026 às 18:00*
