import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/Layout";
import { RoutineList, type ClassRow } from "@/components/RoutineList";
import { getBdParts } from "@/lib/timezone";

export const Route = createFileRoute("/routine")({
  head: () => ({
    meta: [
      { title: "Weekly Routine — Class Portal" },
      { name: "description", content: "Browse the full weekly class routine by day." },
    ],
  }),
  component: RoutinePage,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;

function RoutinePage() {
  const today = getBdParts().weekday;
  const initial = (DAYS as readonly string[]).includes(today) ? today : "Sunday";
  const [day, setDay] = useState<string>(initial);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes", day],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("day", day)
        .order("start_time");
      if (error) throw error;
      return data as ClassRow[];
    },
  });

  return (
    <PageShell>
      <div className="grid gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
            Weekly Schedule
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Browse <span className="text-gradient">Routine</span>
          </h1>
        </div>

        <div className="glass-card rounded-2xl p-2 flex gap-1 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                day === d
                  ? "gradient-primary text-primary-foreground shadow-elegant"
                  : "hover:bg-accent text-foreground/70"
              }`}
            >
              {d}
              {d === today && <span className="ml-1.5 text-[10px] opacity-80">• today</span>}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">Loading…</div>
        ) : (
          <RoutineList classes={classes} />
        )}
      </div>
    </PageShell>
  );
}
