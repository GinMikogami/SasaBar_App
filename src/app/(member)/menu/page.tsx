"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveMenus, createOrder } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Menu } from "@/types";
import { MENU_CATEGORIES } from "@/types";
import { Coins, ShoppingBag } from "lucide-react";

export default function MenuPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selected, setSelected] = useState<Menu | null>(null);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    getActiveMenus().then(setMenus);
  }, []);

  async function handleOrder() {
    if (!selected || !user) return;
    setOrdering(true);
    try {
      await createOrder(user.id, user.name, selected);
      await refreshUser();
      toast({
        title: "注文完了",
        description: `${selected.name}を注文しました`,
      });
      setSelected(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "注文に失敗しました";
      toast({ title: "エラー", description: msg, variant: "destructive" });
    } finally {
      setOrdering(false);
    }
  }

  const allCategories = ["すべて", ...MENU_CATEGORIES];

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-serif text-gray-100 tracking-widest">メニュー</h1>
        <div className="mt-1 w-10 h-px gold-gradient" />
      </div>

      {user && (
        <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-lg bg-bar-card border border-bar-border">
          <Coins className="w-4 h-4 text-gold-500" />
          <span className="text-xs text-bar-muted">保有ポイント:</span>
          <span className="text-gold-400 font-semibold">
            {user.points.toLocaleString()}pt
          </span>
        </div>
      )}

      <Tabs defaultValue="すべて">
        <TabsList className="w-full mb-4">
          {allCategories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="flex-1 text-xs">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {allCategories.map((cat) => {
          const items =
            cat === "すべて" ? menus : menus.filter((m) => m.category === cat);
          return (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-2 gap-3">
                {items.map((menu) => (
                  <Card
                    key={menu.id}
                    className="cursor-pointer hover:border-gold-500/30 transition-colors active:scale-[0.98]"
                    onClick={() => setSelected(menu)}
                  >
                    <CardContent className="p-3">
                      {menu.imageUrl && (
                        <div className="w-full h-28 rounded-md overflow-hidden mb-3 bg-bar-dark">
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Badge variant="secondary" className="text-[10px] mb-2">
                        {menu.category}
                      </Badge>
                      <h3 className="text-gray-100 text-sm font-medium">{menu.name}</h3>
                      <p className="text-bar-muted text-xs mt-1 line-clamp-2">
                        {menu.description}
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-gold-500" />
                        <span className="text-gold-400 font-semibold text-sm">
                          {menu.pointCost.toLocaleString()}pt
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {items.length === 0 && (
                <p className="text-center text-bar-muted py-12 text-sm">
                  メニューがありません
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selected?.imageUrl && (
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-gray-400 text-sm mb-4">{selected?.description}</p>
            <div className="flex items-center justify-between p-4 rounded-lg bg-bar-dark">
              <span className="text-bar-muted text-sm">必要ポイント</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-gold-500" />
                <span className="text-gold-400 font-bold text-lg">
                  {selected?.pointCost.toLocaleString()}
                </span>
                <span className="text-gold-400 text-sm">pt</span>
              </div>
            </div>
            {user && selected && user.points < selected.pointCost && (
              <p className="text-red-400 text-xs text-center mt-3">
                ポイントが不足しています (現在: {user.points.toLocaleString()}pt)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelected(null)}
            >
              キャンセル
            </Button>
            <Button
              variant="gold"
              onClick={handleOrder}
              disabled={
                ordering ||
                !user ||
                !selected ||
                user.points < selected.pointCost
              }
            >
              <ShoppingBag className="w-4 h-4" />
              {ordering ? "注文中..." : "注文する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
