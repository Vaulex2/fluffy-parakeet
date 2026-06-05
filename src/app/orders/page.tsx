import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/actions/auth";
import { getMyOrders } from "@/lib/actions/customer/orders";
import { getT } from "@/lib/i18n/server";
import OrdersLive from "@/components/orders/OrdersLive";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login?next=/orders");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const { orders, totalPages } = await getMyOrders(page);
  const { t } = getT();

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
        <OrdersLive initialOrders={orders} page={page} totalPages={totalPages} />
      )}
    </div>
  );
}
