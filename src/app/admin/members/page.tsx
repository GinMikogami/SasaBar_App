"use client";

import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUser,
  deleteUserDoc,
  adjustPoints,
} from "@/lib/firebase/firestore";
import { formatDate, formatPoints } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/types";
import { Search, Plus, Minus, Trash2 } from "lucide-react";

export default function MembersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<User | null>(null);
  const [pointDelta, setPointDelta] = useState("");
  const [pointNote, setPointNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setUsers(await getAllUsers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) =>
      u.role === "member" &&
      (u.name.includes(search) ||
        u.email.includes(search) ||
        u.memberNumber?.includes(search))
  );

  async function handleAdjust(sign: 1 | -1) {
    if (!adjusting || !pointDelta) return;
    const delta = parseInt(pointDelta) * sign;
    setSaving(true);
    try {
      await adjustPoints(
        adjusting.id,
        delta,
        "adjust",
        pointNote || `管理者による調整 (${delta > 0 ? "+" : ""}${delta}pt)`
      );
      toast({ title: "完了", description: `${delta > 0 ? "+" : ""}${delta}pt調整しました` });
      setAdjusting(null);
      setPointDelta("");
      setPointNote("");
      load();
    } catch (e: unknown) {
      toast({ title: "エラー", description: e instanceof Error ? e.message : "失敗", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`${user.name}を削除しますか？`)) return;
    try {
      await deleteUserDoc(user.id);
      toast({ title: "削除完了" });
      load();
    } catch {
      toast({ title: "エラー", description: "削除失敗", variant: "destructive" });
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-gray-100 tracking-widest">会員管理</h1>
        <div className="mt-1 w-12 h-px gold-gradient" />
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-bar-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・メール・会員番号"
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-8 text-bar-muted text-sm animate-pulse">ロード中...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>会員番号</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>電話</TableHead>
                  <TableHead>ポイント</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-100">{user.name}</TableCell>
                    <TableCell className="text-bar-muted">{user.memberNumber}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell className="text-gold-400 font-semibold">
                      {formatPoints(user.points)}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjusting(user)}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          Pt調整
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{adjusting?.name} ポイント調整</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-bar-muted text-xs mb-1">現在のポイント</p>
              <p className="text-gold-400 text-2xl font-bold">
                {formatPoints(adjusting?.points ?? 0)}
              </p>
            </div>
            <div>
              <label className="text-gray-300 text-xs tracking-wider block mb-2">
                調整ポイント数
              </label>
              <Input
                type="number"
                value={pointDelta}
                onChange={(e) => setPointDelta(e.target.value)}
                placeholder="500"
                min="1"
              />
            </div>
            <div>
              <label className="text-gray-300 text-xs tracking-wider block mb-2">
                メモ (任意)
              </label>
              <Input
                value={pointNote}
                onChange={(e) => setPointNote(e.target.value)}
                placeholder="来店ボーナス 等"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleAdjust(-1)}
              disabled={saving || !pointDelta}
            >
              <Minus className="w-4 h-4" /> 減算
            </Button>
            <Button
              variant="gold"
              onClick={() => handleAdjust(1)}
              disabled={saving || !pointDelta}
            >
              <Plus className="w-4 h-4" /> 加算
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Coins({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
