# Desafio Corpo e Espírito

App do desafio do GC Samambaia (Lagoinha Valinhos), de 19/out a 15/nov de 2026.

Todo dia, cada participante lê um capítulo de Provérbios (NVI, aberto no app da Bíblia) e faz pelo menos 30 minutos de exercício. Cada tarefa vale 1 ponto. Nos sábados 24/out, 31/out e 07/nov a leitura é dupla, pra fechar os 31 capítulos em 28 dias.

## Como funciona

- **Entrar**: a pessoa cria o próprio acesso com nome, foto e PIN de 4 números. O celular guarda a sessão.
- **Hoje**: as duas tarefas do dia, pontos, sequência e quem do GC já fechou o dia.
- **Leitura**: link pro capítulo na NVI, botão de concluir e a conversa do dia.
- **Treino**: foto obrigatória, tipo de exercício, minutos (mínimo 30) e legenda.
- **Mural**, **Ranking** e **Calendário** pra acompanhar o grupo.
- Dá pra marcar o dia de hoje e o de ontem.

## Stack

Front estático (HTML, CSS e JS puro) no GitHub Pages e Supabase pro banco e pras fotos.

## Configurar

1. Crie um projeto no [Supabase](https://supabase.com).
2. No SQL Editor, rode `supabase/schema.sql`.
3. Coloque a Project URL e a anon key em `config.js`.
