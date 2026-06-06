import Link from "next/link";
import { getReservations } from "@/lib/actions/admin/reservations";
import { getOrders } from "@/lib/actions/admin/orders";
import { getTables } from "@/lib/actions/admin/tables";
import type { ReservationStatus, OrderStatus } from "@/types/database";

function fmt(uzs: number) {
  return uzs.toLocaleString("uz-UZ");
}


const RES_CLS: Record<ReservationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  confirmed: "bg-green-500/15 text-green-400 border-green-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  no_show: "bg-white/5 text-text-muted border-white/10",
};

const ORD_CLS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  preparing: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  ready: "bg-green-500/15 text-green-400 border-green-500/20",
  delivered: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default async function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const [todayRes, allOrders, tables] = await Promise.all([
    getReservations({ date: today }),
    getOrders(),
    getTables(),
  ]);

  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const revenue = allOrders
    .filter((o) => o.created_at.startsWith(today) && o.status !== "cancelled")
    .reduce((s, o) => s + o.total_amount, 0);
  const activeTables = tables.filter((t) => t.is_available).length;

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl sm:text-4xl text-text-primary tracking-tight">DASHBOARD</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="calendar_month" label="Today's Reservations" accent="text-green-400">
          <span className="font-headline text-5xl">{todayRes.length}</span>
        </StatCard>
        <StatCard icon="shopping_bag" label="Pending Orders" accent="text-amber-400">
          <span className="font-headline text-5xl">{pendingOrders.length}</span>
        </StatCard>
        <StatCard icon="payments" label="Revenue Today" accent="text-primary">
          <span className="font-headline text-2xl">{fmt(revenue)}</span>
          <span className="text-text-muted font-body text-xs ml-1">UZS</span>
        </StatCard>
        <StatCard icon="table_restaurant" label="Tables Active" accent="text-blue-400">
          <span className="font-headline text-5xl">{activeTables}</span>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable
          title="LATEST RESERVATIONS"
          viewHref="/admin/reservations"
          cols={["CLIENT", "PHONE", "TIME", "TABLE", "STATUS"]}
          empty="No reservations today"
          rows={todayRes.slice(0, 5).map((r) => (
            <tr key={r.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-3 text-text-primary">{r.guest_name}</td>
              <td className="px-5 py-3">
                <a href={`tel:${r.guest_phone}`} className="text-primary hover:underline">{r.guest_phone}</a>
              </td>
              <td className="px-5 py-3 text-text-muted whitespace-nowrap">{r.start_time.slice(0, 5)}</td>
              <td className="px-5 py-3 text-text-muted">
                {r.restaurant_tables ? `T${r.restaurant_tables.table_number}` : "—"}
              </td>
              <td className="px-5 py-3">
                <Badge cls={RES_CLS[r.status]}>{r.status.replace(/_/g, " ")}</Badge>
              </td>
            </tr>
          ))}
        />

        <DataTable
          title="LATEST ORDERS"
          viewHref="/admin/orders"
          cols={["CUSTOMER", "TYPE", "TOTAL", "STATUS"]}
          empty="No orders yet"
          rows={allOrders.slice(0, 5).map((o) => (
            <tr key={o.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-3">
                <p className="text-text-primary">{o.customer_name ?? "—"}</p>
                {o.customer_phone && (
                  <a href={`tel:${o.customer_phone}`} className="text-primary text-xs hover:underline">
                    {o.customer_phone}
                  </a>
                )}
              </td>
              <td className="px-5 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  o.order_type === "delivery"
                    ? "bg-primary/15 text-primary border-primary/20"
                    : "border-surface-border text-text-muted"
                }`}>
                  {o.order_type.toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-3 text-primary font-medium whitespace-nowrap">
                {fmt(o.total_amount)} UZS
              </td>
              <td className="px-5 py-3">
                <Badge cls={ORD_CLS[o.status]}>{o.status}</Badge>
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  accent,
  children,
}: {
  icon: string;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`material-symbols-outlined text-[18px] ${accent}`}>{icon}</span>
        <span className="text-text-muted font-body text-xs">{label}</span>
      </div>
      <div className="text-text-primary flex items-baseline gap-1">{children}</div>
    </div>
  );
}

function DataTable({
  title,
  viewHref,
  cols,
  rows,
  empty,
}: {
  title: string;
  viewHref: string;
  cols: string[];
  rows: React.ReactNode[];
  empty: string;
}) {
  return (
    <section className="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <h2 className="font-headline text-base text-text-primary tracking-tight">{title}</h2>
        <Link href={viewHref} className="text-primary text-xs font-body hover:underline">View All</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-text-muted text-xs">
              {cols.map((c) => (
                <th key={c} className="px-5 py-3 text-left font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="px-5 py-8 text-center text-text-muted">
                  {empty}
                </td>
              </tr>
            ) : rows}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${cls}`}>
      {children}
    </span>
  );
}
