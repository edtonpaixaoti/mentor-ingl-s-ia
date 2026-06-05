import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
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
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Speech recognition and synthesis states
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chat-autospeak") === "true";
    }
    return false;
  });
  const recognitionRef = useRef<any>(null);

  // Load user preferences for voice settings
  const { data: prefs } = useQuery({
    queryKey: ["prefs"],
    queryFn: async () => (await supabase.from("user_preferences").select("*").maybeSingle()).data,
    staleTime: 60_000,
  });

  const voiceGender = prefs?.voice_gender ?? "female";
  const speakingSpeed = Number(prefs?.speaking_speed ?? 1);

  const { data: sessionData } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () =>
      (await supabase.from("chat_sessions").select("id,title").eq("id", sessionId).maybeSingle()).data,
    staleTime: 60_000,
  });

  const { data: messages = [] } = useQuery<Msg[]>({
    queryKey: ["messages", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,role,content")
        .eq("session_id", sessionId)
        .order("created_at");
      return (data as Msg[]) ?? [];
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamText]);

  useEffect(() => { inputRef.current?.focus(); }, [sessionId, streaming]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem("chat-autospeak", String(next));
      if (!next && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
      }
      return next;
    });
  };

  const speakText = (id: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (currentlySpeakingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown tags for natural speech synthesis
    const cleanText = text
      .replace(/[*#`_\-]/g, "") // remove formatting symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // keep only text from markdown links

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

    // Match voice according to saved preferences
    let selectedVoice = englishVoices.find((v) => {
      const name = v.name.toLowerCase();
      if (voiceGender === "male") {
        return name.includes("male") || name.includes("david") || name.includes("mark") || name.includes("george");
      } else {
        return name.includes("female") || name.includes("zira") || name.includes("google us") || name.includes("samantha") || name.includes("hazel");
      }
    });

    if (!selectedVoice && englishVoices.length > 0) {
      selectedVoice = englishVoices[0];
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speakingSpeed;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador", {
        description: "Recomendamos usar o Google Chrome ou Microsoft Edge."
      });
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop playing text if user speaks
      setCurrentlySpeakingId(null);
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US"; // Practice English!
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setInput((prev) => {
        const space = prev.length > 0 && !prev.endsWith(" ") ? " " : "";
        return prev + space + resultText;
      });
    };

    rec.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      toast.error("Erro ao acessar o microfone", { description: "Verifique se concedeu permissão de áudio." });
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (!session) { toast.error("Sessão expirada. Faça login novamente."); return; }

    setInput("");
    setStreaming(true);
    setStreamText("");

    const userId = session.user.id;
    const accessToken = session.access_token;

    // Store snapshot for title check BEFORE cache update
    const isFirstMessage = messages.length === 0;

    // Insert user message to DB
    const { data: userMsg, error: insertErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, user_id: userId, role: "user", content: text })
      .select("id,role,content")
      .single();

    if (insertErr) {
      setStreaming(false);
      toast.error("Erro ao enviar mensagem", { description: insertErr.message });
      return;
    }

    // Optimistic cache update for user message
    qc.setQueryData<Msg[]>(["messages", sessionId], (old = []) => [...old, userMsg as Msg]);

    // Update session title from first message (fix A2: use snapshot, not stale cache)
    if (isFirstMessage) {
      const title = text.slice(0, 60);
      await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["session", sessionId] });
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

    // Build messages array for API
    const allMsgs = [...messages, userMsg as Msg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
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

      // Persist assistant message
      const { data: assistantMsg } = await supabase
        .from("chat_messages")
        .insert({ session_id: sessionId, user_id: userId, role: "assistant", content: full })
        .select("id,role,content")
        .single();

      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);

      setStreamText("");
      if (assistantMsg) {
        qc.setQueryData<Msg[]>(["messages", sessionId], (old = []) => [...old, assistantMsg as Msg]);
        
        // Auto-speak response if enabled
        if (autoSpeak) {
          speakText(assistantMsg.id, full);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado ao contatar a IA");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/chat" })} aria-label="Voltar para lista de conversas">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{sessionData?.title ?? "Conversa"}</h1>
          <p className="text-xs text-muted-foreground">Mentor de inglês com IA · 1 crédito/mensagem</p>
        </div>
        {/* Toggle Auto-Read */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAutoSpeak}
          className={`shrink-0 gap-1.5 rounded-lg px-2.5 ${
            autoSpeak ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Toggle leitura automática de respostas"
        >
          {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden text-xs font-medium sm:inline">
            {autoSpeak ? "Leitura Ativa" : "Voz Muda"}
          </span>
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6" role="log" aria-live="polite" aria-label="Conversa com mentor de inglês">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Comece a conversar em inglês!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fale clicando no microfone, peça correções ou apenas digite. Seu mentor adapta o nível.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <Bubble
              key={m.id}
              role={m.role}
              content={m.content}
              onSpeak={() => speakText(m.id, m.content)}
              isSpeaking={currentlySpeakingId === m.id}
            />
          ))}
          {streamText && <Bubble role="assistant" content={streamText} streaming />}
          {streaming && !streamText && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Mentor está pensando">
              <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/60 bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          {/* Microphone Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={isListening ? stopListening : startListening}
            className={`h-11 w-11 shrink-0 rounded-xl transition-all ${
              isListening
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse border border-red-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label={isListening ? "Parar gravação" : "Falar mensagem em inglês"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={isListening ? "Ouvindo você falar inglês..." : "Digite em inglês ou fale clicando no microfone..."}
            rows={1}
            className="max-h-40 min-h-[44px] resize-none flex-1"
            disabled={streaming}
            aria-label="Mensagem para o mentor"
          />
          <Button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="bg-gradient-primary shrink-0"
            size="icon"
            aria-label="Enviar mensagem"
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
  onSpeak,
  isSpeaking,
}: {
  role: string;
  content: string;
  streaming?: boolean;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
          isUser
            ? "bg-gradient-primary text-primary-foreground"
            : "border border-border bg-card text-card-foreground flex gap-2 items-start"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="flex-1 flex gap-3 items-start">
            {/* Markdown Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:rounded-lg [&_pre]:bg-muted">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              {streaming && <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" aria-hidden />}
            </div>
            {/* Play Audio Button for Assistant Bubble */}
            {!streaming && onSpeak && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSpeak}
                className={`h-7 w-7 shrink-0 rounded-lg -mr-1 transition-all ${
                  isSpeaking ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                aria-label={isSpeaking ? "Parar áudio" : "Ouvir áudio"}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

