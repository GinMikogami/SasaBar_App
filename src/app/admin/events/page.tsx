"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/firebase/firestore";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Event } from "@/types";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";

export default function EventsAdminPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<EventInput>({ resolver: zodResolver(eventSchema) });

  async function load() {
    setLoading(true);
    try { setEvents(await getEvents()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ title: "", description: "", startDate: "", imageUrl: "" });
    setDialogOpen(true);
  }

  function openEdit(event: Event) {
    setEditing(event);
    const d = event.startDate.toDate();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    reset({ title: event.title, description: event.description, startDate: local, imageUrl: event.imageUrl });
    setDialogOpen(true);
  }

  async function onSubmit(data: EventInput) {
    setSaving(true);
    try {
      const startDate = Timestamp.fromDate(new Date(data.startDate));
      if (editing) {
        await updateEvent(editing.id, { ...data, startDate });
        toast({ title: "更新完了" });
      } else {
        await createEvent({ title: data.title, description: data.description, startDate, imageUrl: data.imageUrl ?? "" });
        toast({ title: "作成完了" });
      }
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      toast({ title: "エラー", description: e instanceof Error ? e.message : "失敗", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: Event) {
    if (!confirm(`「${event.title}」を削除しますか？`)) return;
    await deleteEvent(event.id);
    toast({ title: "削除完了" });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-100 tracking-widest">イベント管理</h1>
          <div className="mt-1 w-12 h-px gold-gradient" />
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4" /> イベント追加
        </Button>
      </div>

      {loading ? (
        <p className="text-bar-muted text-sm animate-pulse">ロード中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title}
                  className="w-full h-36 object-cover" />
              )}
              <CardContent className="pt-4 pb-4">
                <h3 className="text-gray-100 font-medium mb-1">{event.title}</h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarDays className="w-3 h-3 text-gold-500" />
                  <span className="text-gold-400 text-xs">{formatDate(event.startDate)}</span>
                </div>
                <p className="text-bar-muted text-xs line-clamp-2 mb-3">{event.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(event)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(event)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <p className="text-bar-muted text-sm col-span-3 text-center py-8">イベントがありません</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "イベント編集" : "イベント作成"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">タイトル</Label>
              <Input {...register("title")} placeholder="イベントタイトル" />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">説明</Label>
              <Input {...register("description")} placeholder="イベントの説明" />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">開催日時</Label>
              <Input type="datetime-local" {...register("startDate")} />
              {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">画像URL (任意)</Label>
              <Input {...register("imageUrl")} placeholder="https://..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "保存中..." : editing ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
