import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, CalendarDays, Shield, GraduationCap } from "lucide-react";
import { type ReactNode } from "react";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => pathname === p;

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-card mx-3 mt-3 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-elegant">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm sm:text-base">Class Portal CST 5th</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Routine & Notices</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" active={isActive("/")} icon={<Calendar className="size-4" />} label="Today" />
          <NavLink to="/routine" active={isActive("/routine")} icon={<CalendarDays className="size-4" />} label="Weekly" />
          <NavLink to="/auth" active={pathname.startsWith("/auth") || pathname.startsWith("/admin")} icon={<Shield className="size-4" />} label="Admin" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "gradient-primary text-primary-foreground shadow-elegant"
          : "hover:bg-accent text-foreground/70 hover:text-foreground"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">{children}</main>
      <footer className="text-center text-xs text-muted-foreground py-8">
        Fardin Sagor | CST | JPI
      </footer>
    </div>
  );
}
