import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { MessagesSquare, Flame, Trophy, Coins, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Mentor Inglês IA" }] }),
  component: Dashboard,
});

const LEVEL_LABEL: Record<string, string> = {
  iniciante: "Iniciante", basico: "Básico", intermediario: "Intermediário",
  avancado: "Avançado", fluente: "Fluente",
};

function Dashboard() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const { data: credits } = useQuery({
    queryKey: ["credits-dash"],
    queryFn: async () => (await supabase.from("credits").select("*").maybeSingle()).data,
  });
  const { data: recent } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () =>
      (await supabase.from("chat_sessions").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(5)).data ?? [],
  });
  const { data: weekActivity } = useQuery({
    queryKey: ["week-activity"],
    queryFn: async () => {
      const since = new Date(Date.now() - 6 * 86400000);
      since.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("chat_messages")
        .select("created_at")
        .gte("created_at", since.toISOString());
      const buckets: Record<string, number> = {};
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        buckets[days[d.getDay()] + d.getDate()] = 0;
      }
      (data ?? []).forEach((m) => {
        const d = new Date(m.created_at);
        const key = days[d.getDay()] + d.getDate();
        if (key in buckets) buckets[key]++;
      });
      return Object.entries(buckets).map(([dia, msgs]) => ({ dia: dia.replace(/\d+$/, ""), msgs }));
    },
  });

  const xpToNext = 100;
  const xpInLevel = (profile?.xp ?? 0) % xpToNext;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {profile?.full_name?.split(" ")[0] ?? "estudante"} 👋</h1>
        <p className="text-sm text-muted-foreground">Continue sua jornada para fluência em inglês.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Nível atual" value={LEVEL_LABEL[profile?.english_level ?? "iniciante"]} />
        <StatCard icon={<Sparkles className="h-4 w-4" />} label="XP total" value={String(profile?.xp ?? 0)} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Sequência" value={`${profile?.streak_days ?? 0} dias`} />
        <StatCard icon={<Coins className="h-4 w-4" />} label="Créditos" value={`${credits?.balance ?? 0}/${credits?.monthly_grant ?? 500}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Atividade da semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekActivity ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="dia" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="msgs" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Progresso de nível</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-3xl font-bold">{profile?.level ?? 1}</span>
                <span className="text-xs text-muted-foreground">{xpInLevel}/{xpToNext} XP</span>
              </div>
              <Progress value={(xpInLevel / xpToNext) * 100} />
            </div>
            <p className="text-xs text-muted-foreground">
              Continue praticando para subir de nível e desbloquear conquistas.
            </p>
            <Button asChild className="w-full bg-gradient-primary">
              <Link to="/chat"><MessagesSquare className="mr-2 h-4 w-4" /> Praticar agora</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Conversas recentes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/chat">Ver todas <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-border">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link to="/chat/$sessionId" params={{ sessionId: s.id }} className="flex items-center justify-between py-3 hover:text-primary">
                    <span className="truncate text-sm">{s.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma conversa ainda. <Link to="/chat" className="font-medium text-primary">Comece agora</Link>.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">{icon}</div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
