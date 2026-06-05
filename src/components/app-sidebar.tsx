import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessagesSquare,
  Mic,
  BookOpen,
  Dumbbell,
  CalendarCheck,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { title: "Painel", to: "/dashboard", icon: LayoutDashboard },
  { title: "Chat IA", to: "/chat", icon: MessagesSquare },
  { title: "Pronúncia", to: "/pronuncia", icon: Mic, disabled: true },
  { title: "Vocabulário", to: "/vocabulario", icon: BookOpen, disabled: true },
  { title: "Exercícios", to: "/exercicios", icon: Dumbbell, disabled: true },
  { title: "Plano de Estudos", to: "/plano", icon: CalendarCheck, disabled: true },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Mentor Inglês</span>
            <span className="text-xs text-muted-foreground">IA</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} disabled={item.disabled}>
                      {item.disabled ? (
                        <div className="opacity-50">
                          <item.icon />
                          <span>{item.title}</span>
                          <span className="ml-auto text-[10px] uppercase">em breve</span>
                        </div>
                      ) : (
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/configuracoes">
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
