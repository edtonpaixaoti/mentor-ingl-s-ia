import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, MessagesSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Chat IA — Mentor Inglês" }] }),
  component: ChatList,
});

function ChatList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () =>
      (await supabase.from("chat_sessions").select("id,title,updated_at").order("updated_at", { ascending: false })).data ?? [],
  });

  const filtered = (sessions ?? []).filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));

  const createNew = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: u.user.id, title: "Nova conversa" })
      .select("id")
      .single();
    if (error || !data) return toast.error("Erro ao criar sessão");
    qc.invalidateQueries({ queryKey: ["sessions"] });
    navigate({ to: "/chat/$sessionId", params: { sessionId: data.id } });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover");
    qc.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversas com IA</h1>
          <p className="text-sm text-muted-foreground">Pratique inglês conversando com seu mentor.</p>
        </div>
        <Button onClick={createNew} className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> Nova conversa</Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversa…" className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <MessagesSquare className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
          <Button onClick={createNew} className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> Começar primeira conversa</Button>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id}>
              <Card className="flex items-center justify-between gap-2 p-3 hover:shadow-soft">
                <Link to="/chat/$sessionId" params={{ sessionId: s.id }} className="flex flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                    <MessagesSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.updated_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
