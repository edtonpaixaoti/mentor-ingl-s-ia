import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Mentor Inglês IA" },
      { name: "description", content: "Acesse sua conta para começar a aprender inglês com IA." },
    ],
  }),
  component: AuthPage,
});

/** Validates password strength — min 8 chars, at least one letter and one number */
function isStrongPassword(pwd: string): boolean {
  return pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // ── Per-tab isolated state (fix: shared state exposed password across tabs) ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setBusy(false);
    if (error) return toast.error("Não conseguimos entrar", { description: error.message });
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard", replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword(signupPassword)) {
      toast.error("Senha fraca", {
        description: "Use pelo menos 8 caracteres, uma letra e um número.",
      });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: signupFullName },
      },
    });
    setBusy(false);
    if (error) return toast.error("Falha no cadastro", { description: error.message });
    toast.success("Conta criada!", { description: "Você já pode entrar." });
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setBusy(false);
    if (error) return toast.error("Erro ao enviar link", { description: error.message });
    setMagicSent(true);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setBusy(false);
      return toast.error("Erro no login com Google", { description: result.error.message });
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Mentor Inglês IA</h1>
          <p className="mt-1 text-sm text-muted-foreground">Aprenda inglês com inteligência artificial</p>
        </div>

        <Card className="p-6 shadow-elegant">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="magic">Link mágico</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login" className="mt-6 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPwd ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowLoginPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showLoginPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showLoginPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            {/* ── MAGIC LINK ── */}
            <TabsContent value="magic" className="mt-6 space-y-4">
              {magicSent ? (
                <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm">
                  <Mail className="mx-auto mb-2 h-6 w-6 text-success" />
                  Enviamos um link de acesso para <strong>{magicEmail}</strong>. Verifique sua caixa de entrada.
                  <button
                    type="button"
                    className="mt-2 block w-full text-xs text-muted-foreground underline hover:text-foreground"
                    onClick={() => setMagicSent(false)}
                  >
                    Reenviar para outro e-mail
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagic} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sem senha. Receba um link seguro no seu e-mail e entre com um clique.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">E-mail</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      required
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      placeholder="voce@email.com"
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full bg-gradient-primary">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Mail className="mr-2 h-4 w-4" /> Enviar link mágico</>)}
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* ── SIGNUP ── */}
            <TabsContent value="signup" className="mt-6 space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <Input
                    id="signup-name"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Senha{" "}
                    <span className="text-xs text-muted-foreground">(mín. 8 chars, letra + número)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPwd ? "text" : "password"}
                      required
                      minLength={8}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowSignupPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showSignupPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showSignupPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupPassword.length > 0 && (
                    <p className={`text-xs ${isStrongPassword(signupPassword) ? "text-success" : "text-warning"}`}>
                      {isStrongPassword(signupPassword) ? "✓ Senha segura" : "Use letras e números, mín. 8 caracteres"}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Lock className="mr-2 h-4 w-4" /> Criar conta</>)}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou continue com</span>
            <Separator className="flex-1" />
          </div>

          <Button onClick={handleGoogle} variant="outline" className="w-full" disabled={busy}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </Button>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar você concorda com nossos{" "}
          <a href="#" className="underline hover:text-foreground">termos de uso</a>{" "}
          e{" "}
          <a href="#" className="underline hover:text-foreground">política de privacidade</a>.
        </p>
      </div>
    </div>
  );
}
