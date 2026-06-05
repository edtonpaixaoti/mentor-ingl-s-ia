import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreditsBadge } from "@/components/credits-badge";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  // null = still loading, true = needs onboarding, false = onboarded
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("onboarding_completed").maybeSingle();
      if (!cancelled) setNeedsOnboarding(!(data?.onboarding_completed ?? false));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fix C4: use TanStack Router navigate instead of window.location.replace
  useEffect(() => {
    if (needsOnboarding === true && window.location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [needsOnboarding, navigate]);

  // Fix A3: show loading skeleton while checking onboarding status (prevents flash)
  if (needsOnboarding === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-sm">Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <CreditsBadge />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
