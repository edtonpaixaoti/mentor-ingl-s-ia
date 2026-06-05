import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/chat/$sessionId")({
  component: ChatSession,
});

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

function ChatSession() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () =>
      (await supabase.from("chat_sessions").select("id,title").eq("id", sessionId).maybeSingle()).data,
  });

  const { data: messages = [], refetch } = useQuery<Msg[]>({
    queryKey: ["messages", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,role,content")
        .eq("session_id", sessionId)
        .order("created_at");
      return (data as Msg[]) ?? [];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamText]);

  useEffect(() => { inputRef.current?.focus(); }, [sessionId, streaming]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);
    setStreamText("");

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setStreaming(false); return; }

    // Insert user message + optimistic
    const { data: userMsg, error: insertErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, user_id: u.user.id, role: "user", content: text })
      .select("id,role,content")
      .single();
    if (insertErr) { setStreaming(false); toast.error("Erro ao enviar"); return; }
    qc.setQueryData<Msg[]>(["messages", sessionId], (old = []) => [...old, userMsg as Msg]);

    // Update session title from first message
    if (messages.length === 0) {
      const title = text.slice(0, 60);
      await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    }

    // Consume credit
    const { error: credErr } = await supabase.rpc("consume_credits", { _amount: 1, _reason: "chat_message" });
    if (credErr) {
      setStreaming(false);
      toast.error("Créditos insuficientes", { description: "Aguarde a renovação mensal." });
      return;
    }
    qc.invalidateQueries({ queryKey: ["credits"] });
    qc.invalidateQueries({ queryKey: ["credits-dash"] });

    // Stream from API
    try {
      const allMsgs = [...messages, userMsg as Msg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMsgs, sessionId }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        if (res.status === 429) toast.error("Muitas requisições", { description: "Tente novamente em instantes." });
        else if (res.status === 402) toast.error("Créditos da plataforma esgotados", { description: "Tente mais tarde." });
        else toast.error("Erro na IA", { description: errText.slice(0, 120) });
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        full += chunk;
        setStreamText(full);
      }
      // persist assistant message
      await supabase.from("chat_messages").insert({
        session_id: sessionId, user_id: u.user.id, role: "assistant", content: full,
      });
      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
      setStreamText("");
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/chat" })} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{session?.title ?? "Conversa"}</h1>
          <p className="text-xs text-muted-foreground">Mentor de inglês com IA · 1 crédito/mensagem</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Comece a conversar em inglês!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Peça correções, traduções ou apenas pratique. Seu mentor adapta o nível.
              </p>
            </div>
          )}
          {messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)}
          {streamText && <Bubble role="assistant" content={streamText} streaming />}
          {streaming && !streamText && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Digite em inglês ou português…"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none"
            disabled={streaming}
          />
          <Button onClick={send} disabled={streaming || !input.trim()} className="bg-gradient-primary" size="icon">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content, streaming }: { role: string; content: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
          isUser
            ? "bg-gradient-primary text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
            <ReactMarkdown>{content}</ReactMarkdown>
            {streaming && <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />}
          </div>
        )}
      </div>
    </div>
  );
}
