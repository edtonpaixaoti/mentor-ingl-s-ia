# Mentor Inglês IA — Plano de Construção

Aplicação completa em pt-BR é grande demais para uma única entrega. Proponho construir um **MVP funcional** primeiro e iterar. Tudo será real (sem dados mock), com Lovable Cloud (Supabase) + Lovable AI Gateway.

## Stack
- TanStack Start + React + TypeScript + Tailwind + shadcn/ui (stack do template — equivalente ao solicitado)
- Lovable Cloud (Supabase: Auth, Postgres com RLS, Storage)
- Lovable AI Gateway (Gemini por padrão; equivalente prático ao OpenAI no template) para chat, exercícios, plano de estudos, análise de pronúncia
- Web Speech API + AI Gateway TTS para voz
- Recharts para gráficos
- Tema claro/escuro com persistência no banco

> Observação: o template usa AI Gateway da Lovable (modelos Google/OpenAI via gateway). Se você exige **OpenAI direto**, me avise — precisarei da sua OPENAI_API_KEY. Para TTS com vozes masculinas/femininas distintas, usarei a Web Speech API do navegador (sem custo, funciona em desktop/mobile) e ofereço upgrade para OpenAI TTS depois.

## Fase 1 — Fundação (esta entrega)
1. **Design system pt-BR**: tokens HSL, dark/light, tipografia, componentes shadcn customizados
2. **Lovable Cloud habilitado** + schema completo:
   - profiles, user_preferences, chat_sessions, chat_messages, study_plans, exercises, exercise_attempts, vocabulary, vocabulary_reviews, pronunciation_scores, credits, credit_transactions, notifications, achievements, xp_logs, subscriptions, user_roles
   - RLS em todas, triggers updated_at, trigger handle_new_user (cria profile + 500 créditos)
   - Função has_role security definer
3. **Autenticação**: Email/senha + Magic Link + Google OAuth (broker Lovable)
4. **Onboarding**: nome, profissão, nível, objetivo (Viagem/Trabalho/TI/Negócios/Fluência), tempo diário
5. **Layout app**: sidebar responsiva, theme switcher, rota `_authenticated`
6. **Dashboard**: nível atual, tempo de estudo, créditos restantes, atividade semanal (Recharts), lições recentes
7. **Chat IA com threads**: sessões persistidas, streaming, histórico, busca, custo 1 crédito/mensagem
8. **Sistema de créditos**: dedução server-side, reset mensal (função SQL), exibição em tempo real

## Fase 2 — Aprendizado (próxima iteração)
- Gerador de exercícios (5 tipos) — 5 créditos
- Vocabulário (favoritos, difíceis, revisão SRS)
- Plano de estudos gerado por IA
- Sistema de voz (STT + TTS, voz M/F, velocidade)
- Análise de pronúncia com score

## Fase 3 — Engajamento
- Gamificação (XP, níveis, streak, conquistas)
- Notificações in-app + email
- Painel admin

## Estrutura de rotas
```
/                       landing
/auth                   login/cadastro/magic-link
/_authenticated/
  onboarding           primeiro acesso
  dashboard            métricas
  chat                 lista de sessões
  chat/$sessionId      conversa
  exercicios           [Fase 2]
  vocabulario          [Fase 2]
  plano                [Fase 2]
  configuracoes        tema, voz, perfil
  admin                [Fase 3, role=admin]
```

## Confirmações que preciso
1. **OK começar pela Fase 1** (fundação + auth + onboarding + dashboard + chat IA + créditos)?
2. **AI Gateway da Lovable** está OK (Gemini), ou exige OpenAI direto com sua chave?
3. **Google OAuth**: posso configurar agora? (precisa de 1 confirmação sua)

Confirme e começo a construir.