import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarRange, Megaphone, Pin, Clock3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: classes = [] } = useQuery({
    queryKey: ["admin", "classes-count"],
    queryFn: async () => (await supabase.from("classes").select("id, day")).data ?? [],
  });
  const { data: notices = [] } = useQuery({
    queryKey: ["admin", "notices-count"],
    queryFn: async () => (await supabase.from("notices").select("id, is_pinned, published")).data ?? [],
  });

  const stats = [
    { label: "Total Classes", value: classes.length, icon: CalendarRange, hint: "All scheduled sessions" },
    { label: "Published Notices", value: notices.filter((n: any) => n.published).length, icon: Megaphone, hint: "Visible to users" },
    { label: "Pinned Notices", value: notices.filter((n: any) => n.is_pinned).length, icon: Pin, hint: "Always on top" },
    { label: "Active Days", value: new Set(classes.map((c: any) => c.day)).size, icon: Clock3, hint: "Days with classes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your portal content.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</span>
              <s.icon className="size-4 text-primary" />
            </div>
            <div className="text-3xl font-bold mt-2 text-gradient">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold mb-2">Quick actions</h2>
        <p className="text-sm text-muted-foreground">Use the sidebar to manage your weekly routine or publish notices. Changes appear instantly for everyone thanks to realtime sync.</p>
      </div>
    </div>
  );
}
