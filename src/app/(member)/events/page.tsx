"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Event } from "@/types";
import { CalendarDays, Clock } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Event | null>(null);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-serif text-gray-100 tracking-widest">イベント</h1>
        <div className="mt-1 w-10 h-px gold-gradient" />
      </div>

      {loading && (
        <div className="text-center py-12 text-bar-muted text-sm animate-pulse">
          ロード中...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-16">
          <CalendarDays className="w-16 h-16 text-bar-border mx-auto mb-4" />
          <p className="text-bar-muted text-sm">現在予定されているイベントはありません</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:border-gold-500/20 transition-colors cursor-pointer"
            onClick={() => setSelected(event)}
          >
            {event.imageUrl && (
              <div className="w-full h-48 bg-bar-dark">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="pt-4 pb-4">
              <h2 className="text-gray-100 font-semibold text-base mb-2">
                {event.title}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-gold-400 text-xs">
                  {formatDate(event.startDate)}
                </span>
              </div>
              <p className="text-bar-muted text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap">
                {event.description}
              </p>
              {event.description && event.description.length > 60 && (
                <p className="text-gold-500/60 text-xs mt-1">タップして詳細を見る</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-gray-100 font-serif">{selected.title}</DialogTitle>
            </DialogHeader>
            {selected.imageUrl && (
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span className="text-gold-400 text-xs">{formatDate(selected.startDate)}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {selected.description}
            </p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
