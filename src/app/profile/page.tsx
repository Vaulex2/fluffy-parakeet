import { redirect } from "next/navigation";
import Image from "next/image";
import { getUser, getProfile, signOut } from "@/lib/actions/auth";
import { getMyReservations, getUpcomingReservations } from "@/lib/actions/customer/reservations";
import type { ReservationWithTable } from "@/types/database";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import CustomerReservations from "@/components/profile/CustomerReservations";
import LoyaltyCard, { TierChip } from "@/components/profile/LoyaltyCard";
import ProfileStats from "@/components/profile/ProfileStats";
import { getT } from "@/lib/i18n/server";
import { INTL_LOCALE } from "@/lib/i18n/config";
import type { TFunction } from "@/lib/i18n";

function fmtTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtLongDate(date: string, intlTag: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(intlTag, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Relative day label: "Today" / "Tomorrow" / "in N days". */
function countdown(date: string, t: TFunction) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + "T00:00:00");
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return t("profile.today");
  if (days === 1) return t("profile.tomorrow");
  return t("profile.inDays", { count: days });
}

function NextReservation({ r, t, intlTag }: { r: ReservationWithTable; t: TFunction; intlTag: string }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-surface p-6">
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-[90px] pointer-events-none mix-blend-screen" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p className="text-primary font-body text-xs uppercase tracking-widest mb-2">
            {t("profile.nextReservation")} · {countdown(r.reservation_date, t)}
          </p>
          <p className="font-headline text-2xl tracking-tight text-text-primary">
            {fmtLongDate(r.reservation_date, intlTag)}
          </p>
          <p className="font-body text-sm text-text-muted mt-1">
            {fmtTime(r.start_time)} – {fmtTime(r.end_time)} ·{" "}
            {r.restaurant_tables
              ? t("profile.tableSeats", { number: r.restaurant_tables.table_number, seats: r.restaurant_tables.seat_count })
              : t("profile.tableTBD")}{" "}
            · {t("profile.guests", { count: r.guest_count })}
          </p>
        </div>
        <a
          href={`/reservations/manage/${r.manage_token}`}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-primary text-white font-headline tracking-tight px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
          {t("profile.manage")}
        </a>
      </div>
    </section>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login?next=/profile");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const [profile, { reservations, totalPages, total }, upcoming] = await Promise.all([
    getProfile(),
    getMyReservations(page),
    getUpcomingReservations(),
  ]);
  if (!profile) redirect("/auth/login");

  const { t, locale } = getT();
  const intlTag = INTL_LOCALE[locale];
  const memberSince = new Date(profile.created_at).toLocaleDateString(intlTag, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Suspension notice */}
      {profile.is_suspended && (
        <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5">warning</span>
          <div>
            <p className="font-body text-sm text-text-primary font-medium">{t("profile.suspendedTitle")}</p>
            <p className="font-body text-xs text-text-muted mt-0.5">
              {t("profile.suspendedBody")}
            </p>
          </div>
        </div>
      )}

      {/* Hero identity card */}
      <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface bg-seigaiha p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[110px] pointer-events-none mix-blend-screen" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {profile.avatar_url ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-4xl">person</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-headline text-3xl tracking-tight text-text-primary">
              {profile.full_name ?? t("profile.myAccount")}
            </h1>
            <p className="font-body text-sm text-text-muted mt-0.5 truncate">{user.email}</p>
            <p className="font-body text-xs text-text-muted/70 mt-0.5">{t("profile.memberSince", { date: memberSince })}</p>
            <div className="mt-3">
              <TierChip points={profile.loyalty_points} />
            </div>
          </div>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-surface-border text-text-muted font-body text-sm hover:text-text-primary hover:border-primary/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t("profile.signOut")}
            </button>
          </form>
        </div>
      </section>

      {/* Rewards + Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <LoyaltyCard points={profile.loyalty_points} />
        <ProfileStats
          points={profile.loyalty_points}
          upcomingCount={upcoming.length}
          totalBookings={total}
        />
      </div>

      {/* Next reservation highlight */}
      {upcoming[0] && <NextReservation r={upcoming[0]} t={t} intlTag={intlTag} />}

      {/* Reservations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg tracking-tight text-text-primary">{t("profile.myReservations")}</h2>
          <a
            href="/reservations"
            className="text-primary hover:underline font-body text-sm"
          >
            {t("profile.bookTable")}
          </a>
        </div>
        <CustomerReservations
          upcoming={upcoming}
          reservations={reservations}
          totalPages={totalPages}
          page={page}
        />
      </section>

      {/* Account settings */}
      <section className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5">
            <h2 className="font-headline text-lg tracking-tight text-text-primary">{t("profile.accountSettings")}</h2>
            <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div className="px-6 pb-6">
            <ProfileEditForm profile={profile} />
          </div>
        </details>
      </section>
    </div>
  );
}
