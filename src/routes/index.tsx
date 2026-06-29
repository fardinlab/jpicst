import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/Layout";
import { LiveClock } from "@/components/LiveClock";
import { NoticeCard } from "@/components/NoticeCard";
import { RoutineList, getStatuses, type ClassRow } from "@/components/RoutineList";
import { getOfflineClassesForDay } from "@/lib/offline-data";
import { formatCountdown, getBdParts, timeToMinutes, type Day } from "@/lib/timezone";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's Class — Class Portal CST 5th" },
      { name: "description", content: "Live class routine and notices for today, on Bangladesh time." },
    ],
  }),
  component: Index,
});

function Index() {
  const [now, setNow] = useState(() => getBdParts());

  useEffect(() => {
    const t = setInterval(() => setNow(getBdParts()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes", "today", now.weekday],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .eq("day", now.weekday)
          .order("start_time");
        if (error) throw error;
        return data as ClassRow[];
      } catch {
        return getOfflineClassesForDay(now.weekday);
      }
    },
    networkMode: "offlineFirst",
  });

  const statuses = getStatuses(classes, now.minutes, now.weekday as Day);
  const nextClass = classes.find((c) => statuses[c.id] === "next");
  const currentClass = classes.find((c) => statuses[c.id] === "current");

  const countdown = nextClass
    ? formatCountdown(timeToMinutes(nextClass.start_time) * 60 - now.seconds)
    : currentClass
    ? formatCountdown(timeToMinutes(currentClass.end_time) * 60 - now.seconds)
    : null;

  return (
    <PageShell>
      <div className="grid gap-4 sm:gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
            আজকের ক্লাস
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight" suppressHydrationWarning>
            <span className="text-gradient">{now.weekday}</span> Schedule
          </h1>
        </div>

        <LiveClock
          countdown={countdown}
          countdownLabel={currentClass ? "Current class ends in" : nextClass ? "Next class starts in" : "No upcoming class"}
          countdownSubject={currentClass?.subject ?? nextClass?.subject ?? "All done for today"}
        />

        <NoticeCard />

        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Today's Routine</h2>
          <RoutineList classes={classes} statuses={statuses} />
        </div>
      </div>
    </PageShell>
  );
}
