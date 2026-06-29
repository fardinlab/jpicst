import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, User } from "lucide-react";
import { formatTime12, timeToMinutes } from "@/lib/timezone";
import type { ClassRow } from "@/components/RoutineList";

export const Route = createFileRoute("/_authenticated/admin/classes")({
  component: ManageClasses,
});

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

type FormState = {
  day: string; subject: string; teacher: string; room: string; start_time: string; end_time: string;
};
const empty: FormState = { day: "Sunday", subject: "", teacher: "", room: "", start_time: "13:15", end_time: "14:00" };

function ManageClasses() {
  const qc = useQueryClient();
  const { data: classes = [] } = useQuery({
    queryKey: ["admin", "classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("day").order("start_time");
      if (error) throw error;
      return data as ClassRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(c: ClassRow) {
    setEditing(c);
    setForm({
      day: c.day, subject: c.subject, teacher: c.teacher ?? "", room: c.room,
      start_time: c.start_time.slice(0,5), end_time: c.end_time.slice(0,5),
    });
    setOpen(true);
  }

  async function save() {
    const payload = { ...form, teacher: form.teacher.trim() || null };
    const { error } = editing
      ? await supabase.from("classes").update(payload).eq("id", editing.id)
      : await supabase.from("classes").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Class updated" : "Class added");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin", "classes"] });
    qc.invalidateQueries({ queryKey: ["classes"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this class?")) return;
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Class deleted");
    qc.invalidateQueries({ queryKey: ["admin", "classes"] });
    qc.invalidateQueries({ queryKey: ["classes"] });
  }

  const grouped = DAYS.map(d => ({ day: d, items: classes.filter(c => c.day === d).sort((a,b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)) })).filter(g => g.items.length > 0 || true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Routine</h1>
          <p className="text-sm text-muted-foreground">Add, edit, or remove classes for any day.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground">
              <Plus className="size-4 mr-1" /> Add class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit class" : "Add class"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Day</Label>
                  <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Room</Label>
                  <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Teacher (optional)</Label>
                <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start time</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End time</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="gradient-primary text-primary-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {grouped.map(({ day, items }) => (
          <div key={day}>
            <h2 className="font-bold text-lg mb-2">{day} <span className="text-xs text-muted-foreground font-normal">({items.length})</span></h2>
            {items.length === 0 ? (
              <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">No classes.</div>
            ) : (
              <div className="space-y-2">
                {items.map(c => (
                  <div key={c.id} className="glass-card rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                    <div className="text-sm font-mono font-semibold tabular-nums">
                      {formatTime12(c.start_time)} – {formatTime12(c.end_time)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{c.subject}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {c.room}</span>
                        {c.teacher && <span className="flex items-center gap-1"><User className="size-3" /> {c.teacher}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
