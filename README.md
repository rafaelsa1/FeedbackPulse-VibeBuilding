# 🎯 FeedbackPulse

**Ferramenta SaaS para análise automatizada de feedbacks de clientes.**

FeedbackPulse é uma aplicação web que permite colar feedbacks, avaliações, comentários ou reclamações de clientes e gera automaticamente um dashboard visual com insights estratégicos.

---

## ✨ Funcionalidades

- 📊 **Análise de Sentimentos** — Classifica cada feedback como positivo, neutro ou negativo
- 🎯 **Identificação de Problemas** — Detecta categorias de problemas mencionados nos feedbacks
- 💡 **Sugestões de Melhoria** — Gera recomendações baseadas nos problemas encontrados
- 📈 **Dashboard Visual** — Exibe métricas, gráficos e tabelas com os resultados
- 🏷️ **Palavras Frequentes** — Mostra as palavras-chave mais mencionadas
- ⭐ **Nota Geral** — Calcula uma nota de 0 a 10 para a experiência do cliente
- 📋 **Copiar Relatório** — Copia um resumo formatado para o clipboard
- 🖨️ **Imprimir** — Gera versão otimizada para impressão
- 📄 **Carregar Exemplos** — Permite testar com feedbacks de exemplo pré-definidos

---

## 🛠️ Tecnologias Usadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura da página |
| **CSS3** | Estilização e design responsivo |
| **JavaScript** | Lógica do front-end |
| **Node.js** | Ambiente de execução do back-end |
| **Express** | Framework do servidor e API REST |
| **Chart.js** | Gráficos interativos no dashboard |
| **Google Fonts (Inter)** | Tipografia moderna |

---

## 📁 Estrutura do Projeto

```
FeedbackPulse/
├── client/                    # Front-end
│   ├── index.html             # Página principal (SPA)
│   ├── css/
│   │   └── styles.css         # Design system completo
│   ├── js/
│   │   ├── app.js             # Lógica principal e navegação
│   │   ├── api.js             # Chamadas à API do back-end
│   │   ├── charts.js          # Configuração dos gráficos
│   │   └── utils.js           # Utilitários (copiar, imprimir, etc.)
│   └── assets/
│       └── favicon.svg        # Ícone do site
├── server/                    # Back-end
│   ├── index.js               # Servidor Express + rotas da API
│   ├── analyzer.js            # Motor de análise de sentimentos
│   └── keywords.js            # Dicionários de palavras-chave
├── package.json               # Dependências e scripts
├── .gitignore
└── README.md                  # Este arquivo
```

---

## 📋 Pré-requisitos

- **Node.js** versão 18 ou superior — [Baixar aqui](https://nodejs.org/)
- **npm** (incluso com o Node.js)

Para verificar se o Node.js está instalado:

```bash
node --version
npm --version
```

---

## 🚀 Como Instalar

1. **Clone ou baixe o projeto:**

```bash
git clone <url-do-repositorio>
cd FeedbackPulse
```

2. **Instale as dependências:**

```bash
npm install
```

---

## ▶️ Como Rodar

### Iniciar o servidor (front-end + back-end):

```bash
npm start
```

O servidor irá iniciar e exibir:

```
🚀 FeedbackPulse rodando em http://localhost:3001
```

### Modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

### Acessar a aplicação:

Abra o navegador e acesse: **http://localhost:3001**

---

## 🧪 Como Testar

### Teste manual:

1. Acesse `http://localhost:3001` no navegador
2. Clique em **"Começar Análise"**
3. Clique em **"📋 Carregar Exemplos"** para preencher com feedbacks de exemplo
4. Clique em **"🔍 Analisar Feedbacks"**
5. Explore o **Dashboard de Resultados** com métricas, gráficos e insights
6. Teste os botões **"Copiar Relatório"**, **"Imprimir"** e **"Nova Análise"**

### Teste da API via terminal:

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/analisar" -Method POST -ContentType "application/json" -Body '{"feedbacks":["Ótimo produto!","Péssimo atendimento","Bom preço"]}'
```

**Curl:**
```bash
curl -X POST http://localhost:3001/api/analisar \
  -H "Content-Type: application/json" \
  -d '{"feedbacks":["Ótimo produto!","Péssimo atendimento","Bom preço"]}'
```

### Endpoints da API:

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/analisar` | Recebe feedbacks e retorna a análise completa |
| `GET` | `/api/exemplos` | Retorna feedbacks de exemplo para teste |

### Corpo da requisição (POST /api/analisar):

```json
{
  "feedbacks": [
    "Ótimo atendimento!",
    "Produto demorou para chegar",
    "Preço justo e boa qualidade"
  ]
}
```

### Resposta da API:

```json
{
  "total": 3,
  "sentimentoGeral": "positivo",
  "positivos": 2,
  "neutros": 0,
  "negativos": 1,
  "palavrasFrequentes": [
    { "palavra": "ótimo", "contagem": 1, "tipo": "positiva" }
  ],
  "problemas": [
    { "categoria": "Entrega e Prazo", "mencoes": 1 }
  ],
  "sugestoes": [
    "Revisar processos logísticos e melhorar prazos de entrega"
  ],
  "notaGeral": 6.7,
  "feedbacksDetalhados": [
    { "texto": "Ótimo atendimento!", "sentimento": "positivo" },
    { "texto": "Produto demorou para chegar", "sentimento": "negativo" },
    { "texto": "Preço justo e boa qualidade", "sentimento": "positivo" }
  ]
}
```

---

## 📝 Observações

- A aplicação **não utiliza banco de dados** — os dados são processados temporariamente
- **Não há sistema de login** — a ferramenta é de uso aberto
- **Não há planos de pagamento** — é uma ferramenta gratuita
- A análise de sentimentos é feita com **regras de palavras-chave** em português (PT-BR)
- A aplicação é responsiva e funciona em **desktop, tablet e mobile**

---

## 📄 Licença

MIT License — Uso livre para fins educacionais e comerciais.
