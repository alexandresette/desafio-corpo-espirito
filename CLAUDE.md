# Desafio Corpo e Espírito · memória do projeto

Arquivo vivo. Toda conversa nova começa lendo este arquivo e termina atualizando a seção "Diário de mudanças" e o que mais tiver mudado. Fonte da verdade: este arquivo dentro do repositório `alexandresette/desafio-corpo-espirito`.

Última atualização: 19/10/2026 (v=14)

## 1. O que é

App web do desafio do GC Samambaia (Lagoinha Valinhos), de 19/out a 15/nov de 2026 (28 dias). Todo dia cada participante faz duas tarefas:

1. Ler o capítulo do dia de Provérbios (1 ponto).
2. Fazer pelo menos 30 min de exercício (caminhada, corrida, academia, outro) com foto (1 ponto).

No fim, ganha quem tiver mais pontos. O dono é o Xande (Alexandre Sette), líder do GC.

- App no ar: https://alexandresette.github.io/desafio-corpo-espirito/
- Repositório: https://github.com/alexandresette/desafio-corpo-espirito (público, conta pessoal `alexandresette`)
- Referências de UX: GymRats (check-in com foto, ranking) e planos de leitura do Bible.com (leitura + conversa do dia).

## 2. Regras do desafio (no código: topo do `app.js`)

- `START = '2026-10-19'`, `TOTAL_DAYS = 28`, fuso `America/Sao_Paulo`.
- Plano de leitura: 31 capítulos em 28 dias. Sábados com leitura dupla: dia 6 (24/out, Pv 6 e 7), dia 13 (31/out, Pv 14 e 15), dia 20 (07/nov, Pv 22 e 23). Dia duplo vale 1 ponto.
- Pontos: 1 leitura + 1 treino por dia, máximo 56.
- Treino: mínimo 30 min, foto obrigatória, tipo (Caminhada, Corrida, Academia, Outro), legenda opcional.
- Prazo: dá pra marcar o dia de hoje e o de ontem (`canMark`).
- Desempate: mais dias completos, depois maior sequência.

## 3. Stack e infraestrutura

- Front estático, HTML + CSS + JS puro, sem build: `index.html`, `style.css`, `app.js`, `config.js`, `manifest.json`, `proverbios.json`, `assets/`.
- Hospedagem: GitHub Pages, branch `main`, raiz.
- Banco e fotos: Supabase, projeto `desafio-samambaia` (id `milezgzaycnmtgpzyxcu`, região São Paulo, plano grátis), na conta Supabase do Xande (login via GitHub `alexandresette`).
  - URL: `https://milezgzaycnmtgpzyxcu.supabase.co`
  - Chave publicável (pública por natureza, já está no `config.js`): `sb_publishable_jGf0VHhCQbu-YmjbLOsOig_lbOzlEsf`. Nunca usar nem pedir a secret key no front.
  - Plano grátis pausa o projeto após 7 dias sem acesso.
- Schema completo em `supabase/schema.sql`:
  - `participants` (id, name, photo_url, pin_hash, created_at)
  - `checkins` (participant_id, day 1..28, kind 'leitura'|'treino', activity, minutes, photo_url, caption; único por pessoa+dia+tipo)
  - `comments` (participant_id, day, body)
  - `likes` (comment_id, participant_id; chave primária dupla)
  - bucket público `fotos` (pastas `perfil/` e `treinos/`)
  - RLS ligado com política aberta pra `anon` (grupo interno de amigos, decisão consciente).
- Libs externas: `@supabase/supabase-js@2` (jsdelivr) e `heic2any@0.0.4` (carregada só quando a foto é HEIC).
- Fontes: Barlow Condensed (títulos), Figtree (texto), Literata (texto bíblico).

## 4. Como o app funciona (telas e rotas por hash)

- `#/entrar`: botão "Criar meu acesso" + grade de fotos dos participantes, toca na foto e digita o PIN. "Esqueci meu PIN".
- `#/cadastro`: foto obrigatória (com enquadramento), primeiro nome, PIN de 4 números + confirmação. Mostra o que falta ("Falta: foto e PIN").
- `#/trocar-pin`: a própria pessoa toca na foto e cria um PIN novo (sem palavra secreta, decisão do Xande: grupo de amigos).
- `#/hoje`: dia X de 28, barra de progresso, pontos, sequência, posição, as duas tarefas, aviso de "ontem ficou faltando", quem fechou o dia. Tocar no próprio avatar abre "Meu perfil".
- Meu perfil (modal): ajustar enquadramento da foto atual, escolher outra foto, mudar nome, salvar, sair da conta (pede segundo toque).
- `#/leitura/N`: texto do capítulo dentro do app (Bíblia Livre), tocar em versículos seleciona e aparece barra "Copiar" com referência (ex.: "Provérbios 1:5-7,9 (Bíblia Livre)"), botão "Li o capítulo", conversa do dia com curtidas. Link "Prefere a NVI?" abre o Bible.com.
- `#/treino/N`: foto (com enquadramento 4:5), tipo, minutos (stepper de 5 em 5, mínimo 30), legenda, postar.
- `#/mural/N`: faixa com o dia e setas (abre no dia de hoje, setas pra dias anteriores), botão "Compartilhar montagem do dia", comentário mais curtido em destaque, treinos do dia, comentários do dia com coração.
- Montagem do dia: imagem 1080x1350 gerada no navegador (canvas) com até 16 fotos de treino com nome + comentário mais curtido. Prévia com "Compartilhar" (Web Share API) e "Salvar imagem".
- `#/ranking`: pódio com pontos, leituras e treinos dos 3 primeiros; lista do 4º em diante.
- `#/calendario/N`: grade dos 28 dias colorida por % do grupo que completou; tocar no dia mostra cada pessoa com Leitura/Treino (tocar no treino abre a foto).
- Menu de baixo com ícones de linha: Hoje, Mural, Ranking, Calendário.

## 5. Arquitetura do `app.js` (pontos que importam)

- Um IIFE só. `routes[name](arg)` + `render()` no `hashchange`.
- Estado global `S` (people, checkins, comments, likes) carregado por `load()`.
- Sessão: `localStorage['desafio_me']` = id do participante. PIN guardado como SHA-256 de `desafio-samambaia:<id>:<pin>`.
- `DRAFT`: foto e nome do cadastro e foto do treino ficam fora da tela, sobrevivem se a tela for recriada.
- `visibilitychange`: só recarrega dados e redesenha em telas de leitura (hoje, mural, ranking, calendário), nunca em formulário.
- Auto-atualização: `MY_V` lê o `?v=N` do próprio `app.js`; ao abrir e ao voltar pro app, busca o `index.html` sem cache e, se o número mudou, recarrega com `?v=N` (exceto no meio de cadastro, treino ou com enquadramento aberto).
- Fotos: `pickPhoto()` = `decodeAny()` (createImageBitmap, depois `<img>`, depois heic2any) → `limitSize()` (máx 2000 px) → `cropImage()` (tela "Ajuste a foto": arrastar, zoom por controle e pinça) → JPEG. Se nada abrir a imagem, aceita o arquivo original pra não travar o cadastro.
- Curtidas: clique delegado em `[data-like]`, atualização otimista.

## 6. Como publicar uma mudança (fluxo que funciona)

1. Editar os arquivos.
2. Subir o número `?v=N` nas 3 referências do `index.html` (`style.css?v=`, `config.js?v=`, `app.js?v=`). Obrigatório: o GitHub Pages manda `cache-control: max-age=600` e sem isso o celular fica até 10 min na versão velha.
3. Commit + push na `main` com a conta pessoal: antes, `gh api user --jq .login` e, se não for `alexandresette`, `gh auth switch --user alexandresette`.
4. Esperar o build: `gh api repos/alexandresette/desafio-corpo-espirito/pages/builds/latest --jq .status` até `built`.
5. Conferir: `curl -s https://alexandresette.github.io/desafio-corpo-espirito/ | grep -o 'app.js?v=[0-9]*'`.
6. Testar no navegador em largura de celular (420 px). Se for testar com conta real, só olhar, nunca marcar nada; apagar `desafio_me` do localStorage no fim.

Observações de ambiente (aprendidas):
- A sessão em nuvem do Claude não consegue dar push nesse repo (app do GitHub não instalado). O que funcionou: rodar git/gh pelo shell do Mac do Xande (cópia em `/tmp/desafio-corpo-espirito`, que pode sumir; se não existir, clonar de novo).
- Arquivos grandes (imagens) não passam bem colados em comando; gerar no próprio Mac (ex.: ícones via Chrome headless + `sips`).
- Mudanças no banco: SQL Editor do Supabase no Chrome do Xande. Funciona setar o editor com `window.monaco.editor.getModels()[0].setValue(sql)` e clicar em Run. Registrar todo SQL novo em `supabase/schema.sql`.
- Testar telas com dados falsos: copiar o `index.html`, trocar o supabase-js por um mock e rodar no Playwright (Chromium em `/opt/pw-browsers`).

## 7. Decisões e aprendizados (não repetir erros)

- NVI tem direitos autorais (Biblica). O texto dentro do app é a **Bíblia Livre (BLIVRE)**, revisão da Almeida em pt-BR, licença CC BY 4.0, de ebible.org (`porbr2018`), em `proverbios.json` (31 capítulos, 915 versículos). Manter a atribuição na tela e no README. NVI dentro do app só com licença (caminho possível: YouVersion Platform, platform.youversion.com).
- Bug do cadastro "foto aparece mas diz Falta: foto" (Adelcio, navegador Samsung): abrir a galeria dispara `visibilitychange`, a tela era recriada e a foto ficava na tela velha. Correção: `DRAFT` + não redesenhar formulários. Regra: nada de estado de formulário preso em variável local da rota.
- Fotos HEIC não abrem no Chrome Android: converter com heic2any e, em último caso, aceitar o original.
- Nome de classe `top` já é o cabeçalho das telas (`.top` tem display flex). Não reutilizar nomes genéricos.
- iPhone não aceita ícone SVG na tela inicial: usar PNG (`assets/icon-180.png`, `icon-192.png`, `icon-512.png`). Ícone: sol dourado sobre livro aberto, fundo oliva.
- `navigator.share` precisa de toque recente do usuário: gerar a montagem primeiro, mostrar prévia e só compartilhar num segundo toque.
- Nunca usar `alert`/`confirm` (trava o navegador automatizado e é feio no celular); confirmar com segundo toque.
- Link do app deve ser aberto no Safari/Chrome, não dentro do WhatsApp (galeria pode não abrir).

## 8. Identidade visual

- Cores: oliva `#2F3A26`, creme `#F6F1E6`, papel `#FFFDF8`, dourado `#C9963B`, dourado claro `#E2C287`, argila `#8A5A2B`, tinta `#232B1C`.
- Mobile first, alvos de toque de 44 px ou mais, sem emoji na interface.
- Textos em pt-BR, diretos, sem travessão.

## 9. Material de divulgação já feito (entregue no chat, fora do repo)

- Arte do desafio gerada no Gemini (Google AI Studio), formato 4:5, versão "28 dias".
- Imagem "Como funciona o app" (1080x1350).
- Texto de lançamento pro grupo e texto de explicação do app.
- Vídeo tutorial "Como salvar o app na tela de início" (iPhone e Android), 42 s, com narração ElevenLabs (voz Carla), música e efeitos gerados por código, sincronizados com cada toque. A animação era um HTML com `render(t)` exportado quadro a quadro + ffmpeg; os fontes ficaram numa sessão temporária, se precisar refazer, recriar.
- Observação: a chave do Gemini usada está sem créditos (erro 402) desde 19/10.

## 10. Ideias e próximos passos (backlog)

- [ ] Lembrete diário (notificação ou mensagem no WhatsApp) pra quem não marcou o dia.
- [ ] Montagem semanal / final do desafio com estatísticas do grupo.
- [ ] Reações nos treinos (hoje só comentários têm curtida).
- [ ] Painel do líder: ver quem não marcou nada há 2 dias.
- [ ] NVI dentro do app via YouVersion Platform, se a licença permitir.
- [ ] Prévia do link no WhatsApp com imagem (`og:image`).

## 11. Diário de mudanças

Formato: data · versão · o que mudou · por quê. Mais recente em cima.

- 19/10/2026 · v=14 · Pódio do ranking mostra leituras e treinos dos 3 primeiros.
- 19/10/2026 · v=13 · `DRAFT` pra foto/nome sobreviverem à tela recriada; auto-atualização do app; erro de cadastro visível; fallback de `randomUUID`.
- 19/10/2026 · v=12 · Mural por dia com setas; curtidas em comentários (tabela `likes`); montagem do dia pra compartilhar.
- 19/10/2026 · v=11 · Corrige foto perdida ao voltar da galeria (redesenho só em telas de leitura).
- 19/10/2026 · v=9/10 · Ícones no menu; modal Meu perfil (nome, foto, enquadramento, sair); ícone PNG do app.
- 19/10/2026 · v=8 · Tela de enquadramento e zoom da foto (perfil em círculo, treino 4:5).
- 19/10/2026 · v=7 · Foto: HEIC, fotos grandes, fallback pro original, "Falta: ..." no cadastro.
- 19/10/2026 · v=3 a 6 · Texto de Provérbios dentro do app (Bíblia Livre); seleção e cópia de versículos.
- 18/10/2026 · v=2 · App publicado, Supabase configurado e testado.
- 18/10/2026 · Proposta de UI/UX em canvas, arte e texto de lançamento.

## 12. Regras pra quem for mexer (Claude)

1. Ler este arquivo inteiro antes de qualquer mudança.
2. Pequenos passos (lean/kaizen): uma melhoria por vez, testar, publicar.
3. Sempre subir o `?v=N` e conferir o deploy.
4. Ao terminar, atualizar este arquivo: diário de mudanças, versão em "Última atualização", e qualquer seção afetada (telas, regras, decisões, backlog). Commit junto com o código.
5. Não expor dados pessoais dos participantes neste arquivo.
