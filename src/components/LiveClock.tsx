import { useEffect, useState } from "react";
import { getBdParts } from "@/lib/timezone";
import { Clock, Timer } from "lucide-react";

type Props = {
  countdown?: string | null;
  countdownLabel?: string;
  countdownSubject?: string;
};

export function LiveClock({ countdown, countdownLabel, countdownSubject }: Props) {
  const [parts, setParts] = useState<ReturnType<typeof getBdParts> | null>(null);

  useEffect(() => {
    setParts(getBdParts());
    const t = setInterval(() => setParts(getBdParts()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Today</div>
          <div className="text-lg sm:text-2xl font-bold mt-1" suppressHydrationWarning>{parts?.dateStr ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Asia/Dhaka · Bangladesh Time</div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            <Clock className="size-3.5" /> Now
          </div>
          <div className="text-2xl sm:text-4xl font-mono font-bold text-gradient tabular-nums" suppressHydrationWarning>
            {parts?.timeStr ?? "--:--:--"}
          </div>
        </div>
      </div>

      {countdownLabel && (
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1" suppressHydrationWarning>
              <Timer className="size-3" />
              {countdownLabel}
            </div>
            <div className="text-xs text-foreground/80 mt-0.5 truncate" suppressHydrationWarning>
              {countdownSubject}
            </div>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold tabular-nums text-gradient shrink-0" suppressHydrationWarning>
            {countdown ?? "—"}
          </div>
        </div>
      )}
    </div>
  );
}
