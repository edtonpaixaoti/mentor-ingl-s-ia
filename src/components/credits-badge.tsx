import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function CreditsBadge() {
  const { data } = useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credits")
        .select("balance, monthly_grant")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  return (
    <Badge variant="secondary" className="gap-1.5 font-medium">
      <Coins className="h-3.5 w-3.5 text-primary" />
      <span>{data?.balance ?? 0}</span>
      <span className="text-muted-foreground">/{data?.monthly_grant ?? 500}</span>
    </Badge>
  );
}
