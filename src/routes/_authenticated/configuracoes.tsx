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
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Mentor Inglês IA" }] }),
  component: Settings,
});

function Settings() {
  const qc = useQueryClient();
  // Fix A6: use context instead of calling supabase.auth.getUser() every save
  const { user } = useAuth();
  // Fix B2: sync theme with ThemeProvider
  const { theme, setTheme } = useTheme();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
    staleTime: 60_000,
  });
  const { data: prefs } = useQuery({
    queryKey: ["prefs"],
    queryFn: async () => (await supabase.from("user_preferences").select("*").maybeSingle()).data,
    staleTime: 60_000,
  });

  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [voice, setVoice] = useState<"male" | "female">("female");
  const [speed, setSpeed] = useState(1);
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [saving, setSaving] = useState(false);

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
    if (!user) return;
    setSaving(true);

    // Fix A6: treat each error independently and report them separately
    const [{ error: profileError }, { error: prefsError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({ full_name: name, profession })
        .eq("user_id", user.id),
      supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            voice_gender: voice,
            speaking_speed: speed,
            email_notifications: emailNotif,
            in_app_notifications: inAppNotif,
          },
          { onConflict: "user_id" },
        ),
    ]);

    setSaving(false);

    if (profileError) {
      toast.error("Erro ao salvar perfil", { description: profileError.message });
    }
    if (prefsError) {
      toast.error("Erro ao salvar preferências", { description: prefsError.message });
    }
    if (!profileError && !prefsError) {
      toast.success("Preferências salvas com sucesso");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["prefs"] });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferências.</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cfg-name">Nome</Label>
            <Input id="cfg-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-profession">Profissão</Label>
            <Input id="cfg-profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Aparência — Fix B2 */}
      <Card>
        <CardHeader><CardTitle className="text-base">Aparência</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="cfg-theme">Tema</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger id="cfg-theme"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema (automático)</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voz */}
      <Card>
        <CardHeader><CardTitle className="text-base">Voz</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cfg-voice">Voz da IA</Label>
            <Select value={voice} onValueChange={(v) => setVoice(v as "male" | "female")}>
              <SelectTrigger id="cfg-voice"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Voz feminina</SelectItem>
                <SelectItem value="male">Voz masculina</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Velocidade</Label>
              <span className="font-semibold text-primary">{speed.toFixed(2)}x</span>
            </div>
            <Slider value={[speed]} min={0.5} max={1.5} step={0.05} onValueChange={([v]) => setSpeed(v)} />
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notificações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cfg-inapp">Notificações no app</Label>
            <Switch id="cfg-inapp" checked={inAppNotif} onCheckedChange={setInAppNotif} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="cfg-email">Notificações por e-mail</Label>
            <Switch id="cfg-email" checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-gradient-primary">
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
