import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, MessagesSquare, Mic, BookOpen, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mentor Inglês IA — Seu professor de inglês com IA" },
      {
        name: "description",
        content:
          "Aprenda inglês conversando com IA. Plano de estudos, exercícios, pronúncia e vocabulário personalizados.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: MessagesSquare, title: "Chat com IA", desc: "Converse 24h em inglês com correções em tempo real." },
  { icon: Mic, title: "Voz e Pronúncia", desc: "Pratique falando e receba avaliação de pronúncia." },
  { icon: BookOpen, title: "Vocabulário", desc: "Salve palavras, exemplos e revise no momento certo." },
  { icon: Trophy, title: "Gamificação", desc: "Conquiste XP, suba de nível e mantenha sua streak." },
  { icon: Zap, title: "Exercícios IA", desc: "Múltipla escolha, tradução, leitura — gerados para você." },
  { icon: Sparkles, title: "Plano de estudos", desc: "Trilha personalizada segundo seu nível e objetivo." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold">Mentor Inglês IA</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary shadow-elegant">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              500 créditos grátis por mês
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Seu <span className="text-gradient">mentor de inglês</span> com IA, 24h por dia
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              Converse, pratique pronúncia, faça exercícios e siga um plano de estudos
              personalizado. Tudo em um só lugar, do iniciante ao fluente.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
                <Link to="/auth">Começar agora — grátis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6 transition-all hover:shadow-elegant hover:-translate-y-0.5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mentor Inglês IA — Aprenda inglês com inteligência artificial
        </div>
      </footer>
    </div>
  );
}
