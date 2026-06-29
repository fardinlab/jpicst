import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Pin, PinOff, EyeOff, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/notices")({
  component: ManageNotices,
});

type Notice = { id: string; title: string; description: string; published: boolean; is_pinned: boolean; created_at: string };

function ManageNotices() {
  const qc = useQueryClient();
  const { data: notices = [] } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(true);

  function openNew() {
    setEditing(null); setTitle(""); setDescription(""); setPinned(false); setPublished(true);
    setOpen(true);
  }
  function openEdit(n: Notice) {
    setEditing(n); setTitle(n.title); setDescription(n.description);
    setPinned(n.is_pinned); setPublished(n.published);
    setOpen(true);
  }

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin", "notices"] });
  }

  async function save() {
    const payload = { title, description, is_pinned: pinned, published };
    const { error } = editing
      ? await supabase.from("notices").update(payload).eq("id", editing.id)
      : await supabase.from("notices").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Notice updated" : "Notice published");
    setOpen(false); refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Notice deleted"); refresh();
  }

  async function togglePin(n: Notice) {
    const { error } = await supabase.from("notices").update({ is_pinned: !n.is_pinned }).eq("id", n.id);
    if (error) return toast.error(error.message);
    refresh();
  }

  async function togglePublish(n: Notice) {
    const { error } = await supabase.from("notices").update({ published: !n.published }).eq("id", n.id);
    if (error) return toast.error(error.message);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Notices</h1>
          <p className="text-sm text-muted-foreground">Publish updates that appear instantly on the homepage.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground">
              <Plus className="size-4 mr-1" /> New notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit notice" : "New notice"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center justify-between glass-card rounded-xl px-3 py-2">
                <Label className="cursor-pointer">Pin to top</Label>
                <Switch checked={pinned} onCheckedChange={setPinned} />
              </div>
              <div className="flex items-center justify-between glass-card rounded-xl px-3 py-2">
                <Label className="cursor-pointer">Published</Label>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!title || !description} className="gradient-primary text-primary-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {notices.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">No notices yet.</div>
        )}
        {notices.map(n => (
          <div key={n.id} className="glass-card rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {n.is_pinned && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <Pin className="size-3" /> Pinned
                    </span>
                  )}
                  {!n.published && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Draft</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                  </span>
                </div>
                <h3 className="font-bold mt-1">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.description}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => togglePin(n)} title={n.is_pinned ? "Unpin" : "Pin"}>
                  {n.is_pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => togglePublish(n)} title={n.published ? "Unpublish" : "Publish"}>
                  {n.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(n)}><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(n.id)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
