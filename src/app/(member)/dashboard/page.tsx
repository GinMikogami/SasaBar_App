"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrders } from "@/lib/firebase/firestore";
import { formatDate, formatPoints, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import { Coins, ClipboardList, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.id).then((orders) => setRecentOrders(orders.slice(0, 5)));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-gold-500/60 text-xs tracking-[0.3em] uppercase mb-1">Welcome</div>
        <h1 className="text-2xl font-serif text-gray-100">{user.name} 様</h1>
        <div className="mt-1 w-16 mx-auto h-px gold-gradient" />
      </div>

      {/* Points Card */}
      <Card className="mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-gold-500" />
            <span className="text-xs text-bar-muted tracking-wider">保有ポイント</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight gold-text-gradient">
              {user.points.toLocaleString()}
            </span>
            <span className="text-gold-500 text-lg mb-1">pt</span>
          </div>
        </CardContent>
      </Card>

      {/* Member Info */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-xs text-bar-muted tracking-wider">会員情報</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "会員番号", value: user.memberNumber },
              { label: "登録日", value: formatDate(user.createdAt) },
              { label: "メールアドレス", value: user.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-bar-border last:border-0">
                <span className="text-bar-muted text-xs tracking-wider">{label}</span>
                <span className="text-gray-300 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-gold-500" />
              <span className="text-xs text-bar-muted tracking-wider">最近の注文</span>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center py-2 border-b border-bar-border last:border-0"
                >
                  <div>
                    <p className="text-gray-200 text-sm">{order.menuName}</p>
                    <p className="text-bar-muted text-xs mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={ORDER_STATUS_COLORS[order.status]}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <span className="text-gold-500 text-xs">
                      -{order.pointCost.toLocaleString()}pt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
