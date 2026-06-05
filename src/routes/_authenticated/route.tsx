import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreditsBadge } from "@/components/credits-badge";

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
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

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
        {needsOnboarding && <OnboardingRedirect />}
      </SidebarInset>
    </SidebarProvider>
  );
}

function OnboardingRedirect() {
  useEffect(() => {
    if (window.location.pathname !== "/onboarding") {
      window.location.replace("/onboarding");
    }
  }, []);
  return null;
}
