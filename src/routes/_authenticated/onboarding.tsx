import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const LEVELS = [
  { v: "iniciante", l: "Iniciante", d: "Estou começando agora" },
  { v: "basico", l: "Básico", d: "Sei o essencial" },
  { v: "intermediario", l: "Intermediário", d: "Me viro em conversas simples" },
  { v: "avancado", l: "Avançado", d: "Falo bem, mas quero melhorar" },
  { v: "fluente", l: "Fluente", d: "Quero manter e refinar" },
];

const GOALS = [
  { v: "viagem", l: "Viagem" },
  { v: "trabalho", l: "Trabalho" },
  { v: "ti", l: "TI / Tecnologia" },
  { v: "negocios", l: "Negócios" },
  { v: "fluencia", l: "Fluência" },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [level, setLevel] = useState("iniciante");
  const [goal, setGoal] = useState("fluencia");
  const [minutes, setMinutes] = useState(15);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name, onboarding_completed").maybeSingle();
      if (data?.onboarding_completed) navigate({ to: "/dashboard", replace: true });
      if (data?.full_name) setFullName(data.full_name);
    })();
  }, [navigate]);

  const finish = async () => {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        profession,
        english_level: level as "iniciante" | "basico" | "intermediario" | "avancado" | "fluente",
        learning_goal: goal as "viagem" | "trabalho" | "ti" | "negocios" | "fluencia",
        daily_minutes: minutes,
        onboarding_completed: true,
      })
      .eq("user_id", u.user.id);
    setBusy(false);
    if (error) return toast.error("Erro ao salvar", { description: error.message });
    toast.success("Tudo pronto! Bem-vindo 🎉");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">Vamos personalizar sua jornada</h1>
        <p className="mt-1 text-sm text-muted-foreground">Etapa {step} de 3</p>
      </div>

      <Card className="p-6 shadow-elegant">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seu nome</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Como podemos te chamar?" />
            </div>
            <div className="space-y-2">
              <Label>Profissão</Label>
              <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Desenvolvedor, Estudante…" />
            </div>
            <div className="flex justify-end">
              <Button disabled={!fullName} onClick={() => setStep(2)} className="bg-gradient-primary">Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Qual seu nível atual de inglês?</Label>
              <RadioGroup value={level} onValueChange={setLevel} className="grid gap-2">
                {LEVELS.map((l) => (
                  <Label key={l.v} htmlFor={l.v} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent">
                    <RadioGroupItem value={l.v} id={l.v} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium">{l.l}</div>
                      <div className="text-xs text-muted-foreground">{l.d}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={() => setStep(3)} className="bg-gradient-primary">Continuar</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Qual seu objetivo principal?</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOALS.map((g) => <SelectItem key={g.v} value={g.v}>{g.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Tempo diário de estudo</Label>
                <span className="font-semibold text-primary">{minutes} min</span>
              </div>
              <Slider value={[minutes]} min={5} max={120} step={5} onValueChange={([v]) => setMinutes(v)} />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
              <Button onClick={finish} disabled={busy} className="bg-gradient-primary">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Concluir"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
