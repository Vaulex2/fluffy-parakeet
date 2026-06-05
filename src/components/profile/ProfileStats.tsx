import { getT } from "@/lib/i18n/server";

interface Stat {
  icon: string;
  value: number | string;
  label: string;
}

function StatTile({ icon, value, label }: Stat) {
  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col gap-1">
      <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
      <span className="font-headline text-3xl tracking-tight text-text-primary leading-none mt-1">
        {value}
      </span>
      <span className="font-body text-xs text-text-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export default function ProfileStats({
  points,
  upcomingCount,
  totalBookings,
}: {
  points: number;
  upcomingCount: number;
  totalBookings: number;
}) {
  const { t } = getT();
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile icon="loyalty" value={points.toLocaleString()} label={t("profile.statPoints")} />
      <StatTile icon="event_upcoming" value={upcomingCount} label={t("profile.statUpcoming")} />
      <StatTile icon="restaurant" value={totalBookings} label={t("profile.statBookings")} />
    </div>
  );
}
