import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Layout";
import { LayoutDashboard, CalendarRange, Megaphone, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { navigate({ to: "/auth" }); return; }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
    });
  }, [navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/classes", label: "Manage Routine", icon: CalendarRange },
    { to: "/admin/notices", label: "Manage Notices", icon: Megaphone },
  ] as const;

  if (isAdmin === false) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16">
          <div className="glass-card rounded-2xl p-8 text-center">
            <Shield className="size-12 mx-auto text-primary mb-3" />
            <h1 className="text-xl font-bold">Admin access required</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your account is signed in but does not have the <code>admin</code> role.
              Ask an existing admin to grant access from the database.
            </p>
            <Button className="mt-5" onClick={handleSignOut}>Sign out</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="glass-card rounded-2xl p-3 h-fit lg:sticky lg:top-24">
          <div className="px-3 py-3 flex items-center gap-2">
            <div className="size-8 rounded-lg gradient-primary grid place-items-center">
              <GraduationCap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <nav className="space-y-1 mt-2">
            {items.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "gradient-primary text-primary-foreground shadow-elegant"
                      : "hover:bg-accent text-foreground/70"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 mt-4"
            >
              <LogOut className="size-4" /> Logout
            </button>
          </nav>
        </aside>
        <section>
          {isAdmin === null ? (
            <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">Loading…</div>
          ) : (
            <Outlet />
          )}
        </section>
      </div>
    </div>
  );
}

import { Shield } from "lucide-react";
