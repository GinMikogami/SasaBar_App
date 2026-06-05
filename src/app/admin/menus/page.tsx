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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<MenuInput>({ resolver: zodResolver(menuSchema) });

  async function load() {
    setLoading(true);
    try { setMenus(await getAllMenus()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    setValue("categories", next, { shouldValidate: true });
  }

  function openCreate() {
    setEditing(null);
    setSelectedCategories([]);
    reset({ name: "", description: "", pointCost: 0, categories: [], imageUrl: "", isActive: true });
    setDialogOpen(true);
  }

  function openEdit(menu: Menu) {
    setEditing(menu);
    const cats = menu.categories ?? [];
    setSelectedCategories(cats);
    reset({
      name: menu.name,
      description: menu.description,
      pointCost: menu.pointCost,
      categories: cats,
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
                  <div className="flex-1 mr-2">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(menu.categories ?? []).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                      ))}
                    </div>
                    <h3 className="text-gray-100 font-medium">{menu.name}</h3>
                  </div>
                  <span className="text-gold-400 font-semibold text-sm shrink-0">
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
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">必要ポイント</Label>
              <Input type="number" {...register("pointCost")} placeholder="300" />
              {errors.pointCost && <p className="text-red-400 text-xs">{errors.pointCost.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">カテゴリ（複数選択可）</Label>
              <div className="flex flex-wrap gap-2">
                {MENU_CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        active
                          ? "bg-gold-500 border-gold-500 text-bar-black font-semibold"
                          : "bg-transparent border-bar-border text-bar-muted hover:border-gold-500/50 hover:text-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="text-red-400 text-xs">{errors.categories.message}</p>}
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
