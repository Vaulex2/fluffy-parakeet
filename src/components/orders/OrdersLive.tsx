"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { INTL_LOCALE } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n";
import type { OrderStatus, OrderWithItems } from "@/types/database";

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

const STATUS_CLS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  preparing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ready: "bg-green-500/15 text-green-400 border-green-500/20",
  delivered: "bg-white/5 text-text-muted border-white/10",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

// The forward progress stages a live order moves through.
const STEPS: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

function StatusStepper({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-400 font-body text-sm">
        <span className="material-symbols-outlined text-[18px]">cancel</span>
        {t("orderStatus.cancelled")}
      </div>
    );
  }

  const current = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="flex items-center w-full">
              <span
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-surface-border"
                }`}
              />
              <span
                className={`w-3 h-3 rounded-full shrink-0 transition-colors ${
                  done ? "bg-primary" : "bg-surface-border"
                } ${i === current ? "ring-4 ring-primary/20" : ""}`}
              />
              <span
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === STEPS.length - 1 ? "opacity-0" : i < current ? "bg-primary" : "bg-surface-border"
                }`}
              />
            </div>
            <span
              className={`font-body text-[10px] text-center leading-tight ${
                done ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {t(`orderStatus.${step}` as TranslationKey)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersLive({
  initialOrders,
  page,
  totalPages,
}: {
  initialOrders: OrderWithItems[];
  page: number;
  totalPages: number;
}) {
  const { t, locale } = useLanguage();
  const intlTag = INTL_LOCALE[locale];
  const [orders, setOrders] = useState(initialOrders);
  const [readyToast, setReadyToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(intlTag, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Live status updates for this customer's own orders (RLS-scoped).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("my-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as { id: string; status: OrderStatus };
          setOrders((prev) => {
            const existing = prev.find((o) => o.id === updated.id);
            if (!existing || existing.status === updated.status) return prev;
            if (updated.status === "ready") {
              setReadyToast(true);
              if (toastTimer.current) clearTimeout(toastTimer.current);
              toastTimer.current = setTimeout(() => setReadyToast(false), 6000);
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification(t("orders.trackingReady"));
              }
            }
            return prev.map((o) =>
              o.id === updated.id ? { ...o, status: updated.status } : o,
            );
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ask once for notification permission so the "ready" ping can fire.
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <>
      {readyToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-black font-body text-sm font-semibold px-5 py-3 rounded-full shadow-lg shadow-green-500/30">
          <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          {t("orders.trackingReady")}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-surface border border-surface-border rounded-xl p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-body text-xs text-text-muted font-medium uppercase tracking-widest">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="font-body text-sm text-text-muted mt-0.5">{fmtDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-body px-2.5 py-1 rounded-full border ${STATUS_CLS[order.status]}`}>
                  {t(`orderStatus.${order.status}` as TranslationKey)}
                </span>
                <span className="text-xs font-body px-2.5 py-1 rounded-full border border-surface-border text-text-muted">
                  {t(`orderType.${order.order_type}` as TranslationKey)}
                </span>
              </div>
            </div>

            {/* Live status stepper */}
            <StatusStepper status={order.status} />

            <div className="space-y-1 pt-1">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm font-body">
                  <span className="text-text-muted">
                    {item.quantity}× {item.item_name}
                  </span>
                  <span className="text-text-primary">
                    {formatPrice(item.subtotal ?? item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
              {order.delivery_address && (
                <p className="text-text-muted font-body text-xs truncate max-w-[60%]">
                  📍 {order.delivery_address}
                </p>
              )}
              <p className="ml-auto font-headline text-lg text-primary">
                {formatPrice(order.total_amount)}
              </p>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {page > 1 && (
              <Link
                href={`/orders?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-surface-border text-text-muted font-body text-sm hover:text-text-primary transition-colors"
              >
                {t("orders.prev")}
              </Link>
            )}
            <span className="text-text-muted font-body text-xs">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/orders?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg border border-surface-border text-text-muted font-body text-sm hover:text-text-primary transition-colors"
              >
                {t("orders.next")}
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
