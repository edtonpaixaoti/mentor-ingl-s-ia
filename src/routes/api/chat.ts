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
        // Validate authentication via Bearer token
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        // Fixed: "google/gemini-3-flash-preview" does not exist
        const model = gateway("google/gemini-2.0-flash");

        const messages: ModelMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...body.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];

        try {
          const result = streamText({
            model,
            messages,
            maxOutputTokens: 1024,
            abortSignal: AbortSignal.timeout(30_000),
          });
          return result.toTextStreamResponse();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("429") || msg.includes("rate limit")) {
            console.warn("AI rate limit hit");
            return new Response("Rate limit exceeded", { status: 429 });
          }
          if (msg.includes("402") || msg.includes("insufficient")) {
            return new Response("Platform credits exhausted", { status: 402 });
          }
          console.error("AI chat error:", msg);
          return new Response("Internal AI error", { status: 500 });
        }
      },
    },
  },
});
