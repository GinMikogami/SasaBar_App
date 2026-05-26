"use client";

import { useEffect, useState } from "react";
import { subscribeOrders, updateOrderStatus } from "@/lib/firebase/firestore";
import { formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order, OrderStatus } from "@/types";
import { Radio } from "lucide-react";

const STATUS_FLOW: OrderStatus[] = ["received", "preparing", "completed", "cancelled"];

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    return subscribeOrders(setOrders);
  }, []);

  async function handleStatusChange(order: Order, status: OrderStatus) {
    try {
      await updateOrderStatus(order.id, status);
      toast({ title: "ステータス更新", description: `${order.menuName}: ${ORDER_STATUS_LABELS[status]}` });
    } catch {
      toast({ title: "エラー", variant: "destructive" });
    }
  }

  const displayed = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif text-gray-100 tracking-widest">注文管理</h1>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
          <div className="mt-1 w-12 h-px gold-gradient" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as OrderStatus | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {STATUS_FLOW.map((s) => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>注文番号</TableHead>
                <TableHead>会員名</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>ポイント</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-bar-muted text-xs font-mono">
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-gray-200">{order.userName}</TableCell>
                  <TableCell className="text-gray-100 font-medium">{order.menuName}</TableCell>
                  <TableCell className="text-gold-400">{order.pointCost.toLocaleString()}pt</TableCell>
                  <TableCell className="text-bar-muted text-xs">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order, v as OrderStatus)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_FLOW.map((s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {displayed.length === 0 && (
            <p className="text-center py-8 text-bar-muted text-sm">注文がありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
