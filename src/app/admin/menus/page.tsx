"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "@/lib/firebase/firestore";
import { menuSchema, type MenuInput } from "@/lib/validations/menu";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Menu } from "@/types";
import { MENU_CATEGORIES } from "@/types";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function MenusPage() {
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<MenuInput>({ resolver: zodResolver(menuSchema) });

  async function load() {
    setLoading(true);
    try { setMenus(await getAllMenus()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ name: "", description: "", pointCost: 0, category: "", imageUrl: "", isActive: true });
    setDialogOpen(true);
  }

  function openEdit(menu: Menu) {
    setEditing(menu);
    reset({
      name: menu.name,
      description: menu.description,
      pointCost: menu.pointCost,
      category: menu.category,
      imageUrl: menu.imageUrl,
      isActive: menu.isActive,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: MenuInput) {
    setSaving(true);
    try {
      if (editing) {
        await updateMenu(editing.id, data);
        toast({ title: "更新完了" });
      } else {
        await createMenu(data);
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

  async function handleDelete(menu: Menu) {
    if (!confirm(`「${menu.name}」を削除しますか？`)) return;
    await deleteMenu(menu.id);
    toast({ title: "削除完了" });
    load();
  }

  async function toggleActive(menu: Menu) {
    await updateMenu(menu.id, { isActive: !menu.isActive });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-100 tracking-widest">メニュー管理</h1>
          <div className="mt-1 w-12 h-px gold-gradient" />
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4" /> 追加
        </Button>
      </div>

      {loading ? (
        <p className="text-bar-muted text-sm animate-pulse">ロード中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <Card key={menu.id} className={!menu.isActive ? "opacity-50" : ""}>
              <CardContent className="pt-4 pb-4">
                {menu.imageUrl && (
                  <img src={menu.imageUrl} alt={menu.name}
                    className="w-full h-32 object-cover rounded-md mb-3" />
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="secondary" className="text-[10px] mb-1">{menu.category}</Badge>
                    <h3 className="text-gray-100 font-medium">{menu.name}</h3>
                  </div>
                  <span className="text-gold-400 font-semibold text-sm">
                    {menu.pointCost.toLocaleString()}pt
                  </span>
                </div>
                <p className="text-bar-muted text-xs line-clamp-2 mb-3">{menu.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(menu)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(menu)}>
                    {menu.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(menu)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "メニュー編集" : "メニュー追加"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">商品名</Label>
              <Input {...register("name")} placeholder="生ビール" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">説明</Label>
              <Input {...register("description")} placeholder="商品の説明" />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">必要ポイント</Label>
                <Input type="number" {...register("pointCost")} placeholder="300" />
                {errors.pointCost && <p className="text-red-400 text-xs">{errors.pointCost.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">カテゴリ</Label>
                <Select
                  onValueChange={(v) => setValue("category", v)}
                  defaultValue={editing?.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">画像URL (任意)</Label>
              <Input {...register("imageUrl")} placeholder="https://..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "保存中..." : 編集 ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
