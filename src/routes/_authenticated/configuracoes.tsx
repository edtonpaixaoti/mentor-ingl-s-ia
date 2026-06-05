import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Mentor Inglês IA" }] }),
  component: Settings,
});

function Settings() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const { data: prefs } = useQuery({
    queryKey: ["prefs"],
    queryFn: async () => (await supabase.from("user_preferences").select("*").maybeSingle()).data,
  });

  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [voice, setVoice] = useState<"male" | "female">("female");
  const [speed, setSpeed] = useState(1);
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? "");
      setProfession(profile.profession ?? "");
    }
  }, [profile]);
  useEffect(() => {
    if (prefs) {
      setVoice((prefs.voice_gender as "male" | "female") ?? "female");
      setSpeed(Number(prefs.speaking_speed ?? 1));
      setEmailNotif(prefs.email_notifications ?? true);
      setInAppNotif(prefs.in_app_notifications ?? true);
    }
  }, [prefs]);

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({ full_name: name, profession }).eq("user_id", u.user.id),
      supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: u.user.id,
            voice_gender: voice,
            speaking_speed: speed,
            email_notifications: emailNotif,
            in_app_notifications: inAppNotif,
          },
          { onConflict: "user_id" },
        ),
    ]);
    if (e1 || e2) return toast.error("Erro ao salvar", { description: (e1 ?? e2)?.message });
    toast.success("Preferências salvas");
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["prefs"] });
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferências.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Profissão</Label><Input value={profession} onChange={(e) => setProfession(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Voz</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Voz da IA</Label>
            <Select value={voice} onValueChange={(v) => setVoice(v as "male" | "female")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Voz feminina</SelectItem>
                <SelectItem value="male">Voz masculina</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><Label>Velocidade</Label><span className="font-semibold text-primary">{speed.toFixed(2)}x</span></div>
            <Slider value={[speed]} min={0.5} max={1.5} step={0.05} onValueChange={([v]) => setSpeed(v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notificações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp">Notificações no app</Label>
            <Switch id="inapp" checked={inAppNotif} onCheckedChange={setInAppNotif} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Notificações por e-mail</Label>
            <Switch id="email" checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-gradient-primary">Salvar alterações</Button>
      </div>
    </div>
  );
}
