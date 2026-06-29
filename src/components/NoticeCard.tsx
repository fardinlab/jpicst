import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Megaphone } from "lucide-react";
import { showLocalNotice } from "@/lib/native";

type Notice = {
  id: string;
  title: string;
  description: string;
  is_pinned: boolean;
  published: boolean;
  created_at: string;
};


const CACHE_KEY = "cached_latest_notice_v1";

export function NoticeCard() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const n = (data as Notice | null) ?? null;
      setNotice(n);
      if (n) {
        try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(n)); } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // hydrate from cache after mount to avoid SSR/client mismatch
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (raw) setNotice(JSON.parse(raw) as Notice);
    } catch {}
    load();
    const channel = supabase
      .channel("notices-public")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notices" }, (payload) => {
        const n = payload.new as Notice;
        if (n.published) {
          showLocalNotice(n.title, n.description.slice(0, 140));
        }
        load();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notices" }, () => load())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "notices" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);


  if (loading) return <div className="glass-card rounded-2xl p-6 h-32 animate-pulse" />;
  if (!notice) return null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 size-40 rounded-full gradient-accent opacity-20 blur-3xl" />
      <div className="flex items-start gap-3 sm:gap-4 relative">
        <div className="size-10 sm:size-11 rounded-xl gradient-accent grid place-items-center shrink-0 shadow-elegant">
          <Megaphone className="size-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Latest Notice</span>
            {notice.is_pinned && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Pin className="size-3" /> Pinned
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg sm:text-xl mt-1">{notice.title}</h3>
          <p className="text-sm sm:text-base text-foreground/80 mt-2 whitespace-pre-wrap">{notice.description}</p>
          <div className="text-xs text-muted-foreground mt-3">
            {new Date(notice.created_at).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
          </div>
        </div>
      </div>
    </div>
  );
}
