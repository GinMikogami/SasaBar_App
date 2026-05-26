"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getAllOrders } from "@/lib/firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import type { User, Order } from "@/types";
import { Users, ShoppingBag, Coins, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllOrders()])
      .then(([u, o]) => {
        setUsers(u);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (o) => o.createdAt?.toDate() >= today
  );

  const totalPointsIssued = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.pointCost, 0);

  const stats = [
    {
      label: "総会員数",
      value: users.filter((u) => u.role === "member").length,
      unit: "名",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "本日の注文数",
      value: todayOrders.length,
      unit: "件",
      icon: ShoppingBag,
      color: "text-green-400",
    },
    {
      label: "総注文数",
      value: orders.length,
      unit: "件",
      icon: TrendingUp,
      color: "text-gold-400",
    },
    {
      label: "総ポイント消費",
      value: totalPointsIssued.toLocaleString(),
      unit: "pt",
      icon: Coins,
      color: "text-gold-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-100 tracking-widest">ダッシュボード</h1>
        <div className="mt-1 w-12 h-px gold-gradient" />
      </div>

      {loading ? (
        <p className="text-bar-muted text-sm animate-pulse">ロード中...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, unit, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-bar-muted text-xs tracking-wider">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-bold ${color}`}>{value}</span>
                    <span className="text-bar-muted text-sm mb-1">{unit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="text-gray-300 text-sm tracking-wider mb-4">最新注文</h2>
              <div className="space-y-2">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center py-2 border-b border-bar-border last:border-0"
                  >
                    <div>
                      <p className="text-gray-200 text-sm">{order.menuName}</p>
                      <p className="text-bar-muted text-xs">{order.userName}</p>
                    </div>
                    <span className="text-gold-500 text-sm">
                      {order.pointCost.toLocaleString()}pt
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
