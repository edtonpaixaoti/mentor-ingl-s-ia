import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";

type Body = { messages?: Array<{ role: string; content: string }>; sessionId?: string };

const SYSTEM_PROMPT = `Você é o "Mentor Inglês IA", um professor de inglês paciente, motivador e bilíngue (português brasileiro e inglês).

Suas funções:
- Atuar como Professor de Inglês, Parceiro de Conversação, Mentor de Estudos e Assistente de Pronúncia.
- Adaptar a complexidade do inglês ao nível do aluno (iniciante, básico, intermediário, avançado, fluente).
- Corrigir erros gramaticais de forma gentil, mostrando a versão correta e explicando rapidamente em português quando útil.
- Sugerir vocabulário, sinônimos, expressões idiomáticas e exemplos práticos.
- Traduzir quando o aluno pedir.
- Formatar respostas em Markdown (negrito para termos, listas para correções/dicas).
- Encorajar o aluno e propor próximos passos curtos.

Mantenha respostas concisas (2-6 parágrafos curtos). Sempre responda primariamente em inglês, exceto quando o aluno escrever em português ou pedir explicação em PT.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const messages: ModelMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...body.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];

        try {
          const result = streamText({ model, messages });
          return result.toTextStreamResponse();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const status = /429/.test(msg) ? 429 : /402/.test(msg) ? 402 : 500;
          console.error("AI chat error:", msg);
          return new Response(msg, { status });
        }
      },
    },
  },
});
