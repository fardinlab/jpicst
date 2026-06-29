import { formatTime12, timeToMinutes, type Day } from "@/lib/timezone";
import { MapPin, User, Clock3 } from "lucide-react";

export type ClassRow = {
  id: string;
  day: string;
  subject: string;
  teacher: string | null;
  room: string;
  start_time: string;
  end_time: string;
};

type Status = "past" | "current" | "next" | "upcoming";

export function getStatuses(classes: ClassRow[], nowMin: number, today: Day): Record<string, Status> {
  const todays = classes.filter(c => c.day === today)
    .sort((a,b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
  const result: Record<string, Status> = {};
  let foundNext = false;
  for (const c of todays) {
    const s = timeToMinutes(c.start_time);
    const e = timeToMinutes(c.end_time);
    if (nowMin >= s && nowMin < e) result[c.id] = "current";
    else if (nowMin < s && !foundNext) { result[c.id] = "next"; foundNext = true; }
    else if (nowMin >= e) result[c.id] = "past";
    else result[c.id] = "upcoming";
  }
  return result;
}

export function RoutineList({
  classes,
  statuses,
}: {
  classes: ClassRow[];
  statuses?: Record<string, Status>;
}) {
  if (classes.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <div className="text-lg font-semibold">No class scheduled today.</div>
        <div className="text-sm text-muted-foreground mt-1">Enjoy your day off!</div>
      </div>
    );
  }

  const sorted = [...classes].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  return (
    <div className="space-y-3">
      {sorted.map((c) => {
        const status = statuses?.[c.id];
        const isCurrent = status === "current";
        const isNext = status === "next";
        const isPast = status === "past";

        return (
          <div
            key={c.id}
            className={`glass-card rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden ${
              isCurrent ? "ring-2 ring-primary shadow-elegant" : ""
            } ${isNext ? "ring-2 ring-[var(--accent-teal)]" : ""} ${isPast ? "opacity-60" : ""}`}
          >
            {isCurrent && (
              <div className="absolute top-0 left-0 w-1.5 h-full gradient-primary" />
            )}
            {isNext && (
              <div className="absolute top-0 left-0 w-1.5 h-full gradient-accent" />
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2 text-sm font-mono font-semibold tabular-nums min-w-fit">
                <Clock3 className="size-4 text-primary" />
                <span>{formatTime12(c.start_time)}</span>
                <span className="text-muted-foreground">—</span>
                <span>{formatTime12(c.end_time)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base sm:text-lg leading-tight">{c.subject}</h3>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full gradient-primary text-primary-foreground animate-pulse">
                      Now
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full gradient-accent text-primary-foreground">
                      Next
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {c.room}</span>
                  {c.teacher && (
                    <span className="flex items-center gap-1"><User className="size-3.5" /> {c.teacher}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
