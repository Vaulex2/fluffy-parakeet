import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/actions/auth";
import { getMyOrders } from "@/lib/actions/customer/orders";
import { getT } from "@/lib/i18n/server";
import { INTL_LOCALE } from "@/lib/i18n/config";
import type { TFunction } from "@/lib/i18n";
import type { OrderStatus } from "@/types/database";

const STATUS_CLS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  preparing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ready: "bg-green-500/15 text-green-400 border-green-500/20",
  delivered: "bg-white/5 text-text-muted border-white/10",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

function fmtDate(iso: string, intlTag: string) {
  return new Date(iso).toLocaleDateString(intlTag, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login?next=/orders");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const { orders, totalPages } = await getMyOrders(page);
  const { t, locale } = getT();
  const intlTag = INTL_LOCALE[locale];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl tracking-tight text-text-primary">{t("orders.title")}</h1>
        <Link href="/menu" className="text-primary hover:underline font-body text-sm">
          {t("orders.orderAgain")}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-text-muted/40 block mb-4">
            shopping_bag
          </span>
          <p className="text-text-muted font-body">{t("orders.noOrders")}</p>
          <Link href="/menu" className="text-primary hover:underline font-body text-sm mt-2 inline-block">
            {t("orders.browseMenu")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-surface-border rounded-xl p-5 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-xs text-text-muted font-medium uppercase tracking-widest">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-body text-sm text-text-muted mt-0.5">
                    {fmtDate(order.created_at, intlTag)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-body px-2.5 py-1 rounded-full border ${STATUS_CLS[order.status]}`}
                  >
                    {t(`orderStatus.${order.status}` as Parameters<TFunction>[0])}
                  </span>
                  <span className="text-xs font-body px-2.5 py-1 rounded-full border border-surface-border text-text-muted">
                    {t(`orderType.${order.order_type}` as Parameters<TFunction>[0])}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm font-body">
                    <span className="text-text-muted">
                      {item.quantity}× {item.item_name}
                    </span>
                    <span className="text-text-primary">{formatPrice(item.subtotal ?? item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
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
      )}
    </div>
  );
}
