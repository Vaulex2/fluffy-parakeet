"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrders, updateOrderStatus } from "@/lib/actions/admin/orders";
import type { OrderStatus, OrderWithItems } from "@/types/database";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
};

const BTN_CLS: Partial<Record<OrderStatus, string>> = {
  pending: "bg-amber-500 hover:bg-amber-600 text-black",
  preparing: "bg-orange-500 hover:bg-orange-600 text-white",
  ready: "bg-green-600 hover:bg-green-700 text-white",
};

const BAR_CLS: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  preparing: "bg-orange-500",
  ready: "bg-green-500",
  delivered: "bg-blue-500",
  cancelled: "bg-primary",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Mark Preparing",
  preparing: "Mark Ready",
  ready: "Mark Delivered",
};

const FILTERS: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function fmt(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function OrderFeed({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        getOrders().then(setOrders);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function advance(order: OrderWithItems) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    startTransition(async () => {
      await updateOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    });
  }

  function cancel(order: OrderWithItems) {
    startTransition(async () => {
      await updateOrderStatus(order.id, "cancelled");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)));
    });
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-4xl text-text-primary tracking-tight">ORDERS</h1>
        <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 font-body text-xs">Live</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full font-body text-sm border transition-colors ${
              filter === f.value
                ? "bg-primary border-primary text-white"
                : "border-surface-border text-text-muted hover:border-primary/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted font-body">
          <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">shopping_bag</span>
          No orders
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <div
                key={order.id}
                className="bg-surface border border-surface-border rounded-xl overflow-hidden"
              >
                <div className={`h-1 ${BAR_CLS[order.status]}`} />
                <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5">
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-text-muted text-xs">
                        ORD-{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          order.order_type === "delivery"
                            ? "bg-primary/15 text-primary border-primary/20"
                            : "border-surface-border text-text-muted"
                        }`}
                      >
                        {order.order_type.toUpperCase()}
                      </span>
                      <span className="text-text-muted text-xs font-body">{timeAgo(order.created_at)}</span>
                    </div>

                    <div>
                      <p className="text-text-primary font-body font-semibold">{order.customer_name ?? "—"}</p>
                      {order.customer_phone && (
                        <a href={`tel:${order.customer_phone}`} className="text-primary text-sm hover:underline">
                          {order.customer_phone}
                        </a>
                      )}
                      {order.delivery_address && (
                        <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {order.delivery_address}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-0.5">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-text-muted text-sm font-body flex justify-between">
                          <span>{item.item_name}</span>
                          <span className="text-text-primary ml-4">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 min-w-[160px]">
                    <div className="text-right">
                      <p className="text-text-muted font-body text-xs">Total</p>
                      <p className="font-headline text-2xl text-primary tracking-tight">{fmt(order.total_amount)}</p>
                    </div>
                    <div className="space-y-2 w-full">
                      {next && BTN_CLS[order.status] && (
                        <button
                          onClick={() => advance(order)}
                          disabled={isPending}
                          className={`w-full py-2 px-4 rounded-lg font-body text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${BTN_CLS[order.status]}`}
                        >
                          {NEXT_LABEL[order.status]}
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      )}
                      {(order.status === "pending" || order.status === "preparing") && (
                        <button
                          onClick={() => cancel(order)}
                          disabled={isPending}
                          className="w-full py-1.5 px-4 rounded-lg font-body text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
