"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getPointHistory, getUserOrders } from "@/lib/firebase/firestore";
import { logoutUser } from "@/lib/firebase/auth";
import { formatDate, formatPoints, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PointHistory, Order } from "@/types";
import { LogOut, TrendingUp, TrendingDown, Settings2 } from "lucide-react";

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      getPointHistory(user.id).then(setHistory);
      getUserOrders(user.id).then(setOrders);
    }
  }, [user]);

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif text-gray-100 tracking-widest">マイページ</h1>
          <div className="mt-1 w-10 h-px gold-gradient" />
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-4 h-4 text-bar-muted" />
        </Button>
      </div>

      {/* Profile */}
      <Card className="mb-5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-gold-500" />
            <span className="text-xs text-bar-muted tracking-wider">プロフィール</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "お名前", value: user.name },
              { label: "会員番号", value: user.memberNumber },
              { label: "メールアドレス", value: user.email },
              { label: "電話番号", value: user.phone },
              { label: "登録日", value: formatDate(user.createdAt) },
              { label: "保有ポイント", value: formatPoints(user.points) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2 border-b border-bar-border last:border-0"
              >
                <span className="text-bar-muted text-xs tracking-wider">{label}</span>
                <span className="text-gray-300 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Tabs defaultValue="points">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="points" className="flex-1">ポイント履歴</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">注文履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <div className="space-y-2">
            {history.length === 0 && (
              <p className="text-center text-bar-muted py-8 text-sm">履歴がありません</p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 rounded-lg bg-bar-card border border-bar-border"
              >
                <div className="flex items-center gap-3">
                  {item.point > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-gray-200 text-sm">{item.description}</p>
                    <p className="text-bar-muted text-xs mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold text-sm ${
                    item.point > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.point > 0 ? "+" : ""}
                  {item.point.toLocaleString()}pt
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-2">
            {orders.length === 0 && (
              <p className="text-center text-bar-muted py-8 text-sm">注文履歴がありません</p>
            )}
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 rounded-lg bg-bar-card border border-bar-border"
              >
                <div>
                  <p className="text-gray-200 text-sm">{order.menuName}</p>
                  <p className="text-bar-muted text-xs mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={ORDER_STATUS_COLORS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <span className="text-gold-500 text-xs">
                    -{order.pointCost.toLocaleString()}pt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
