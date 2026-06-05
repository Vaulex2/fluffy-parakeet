import type { ReactNode } from "react";
import { getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n";

export interface Tier {
  /** translation key for the tier label */
  key: TranslationKey;
  /** classes for the small chip (text + bg + border) */
  cls: string;
  /** points where this tier starts */
  floor: number;
  /** points where the next tier starts, or null at the top */
  next: number | null;
  /** translation key of the next tier, or null at the top */
  nextKey: TranslationKey | null;
}

const BRONZE: Tier = { key: "tier.bronze", cls: "text-orange-400 bg-orange-500/15 border-orange-500/30", floor: 0, next: 1000, nextKey: "tier.silver" };
const SILVER: Tier = { key: "tier.silver", cls: "text-slate-300 bg-slate-500/15 border-slate-400/30", floor: 1000, next: 5000, nextKey: "tier.gold" };
const GOLD: Tier = { key: "tier.gold", cls: "text-amber-400 bg-amber-500/15 border-amber-500/30", floor: 5000, next: null, nextKey: null };

export function tierFor(points: number): Tier {
  if (points >= 5000) return GOLD;
  if (points >= 1000) return SILVER;
  return BRONZE;
}

/** Small inline chip — reused in the profile hero. */
export function TierChip({ points }: { points: number }) {
  const { t } = getT();
  const tier = tierFor(points);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-body text-xs font-medium ${tier.cls}`}>
      <span className="material-symbols-outlined text-[14px]">star</span>
      {t(tier.key)} · {points.toLocaleString()} {t("profile.pts")}
    </span>
  );
}

export default function LoyaltyCard({ points }: { points: number }) {
  const { t } = getT();
  const tier = tierFor(points);

  let pct = 100;
  let footer: ReactNode = t("profile.topTier");
  if (tier.next !== null) {
    const span = tier.next - tier.floor;
    pct = Math.min(100, Math.max(0, Math.round(((points - tier.floor) / span) * 100)));
    const remaining = tier.next - points;
    footer = (
      <>
        <span className="text-text-primary font-medium">{remaining.toLocaleString()} {t("profile.pts")}</span> {t("profile.toNext", { tier: tier.nextKey ? t(tier.nextKey) : "" })}
      </>
    );
  }

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs font-body font-medium uppercase tracking-widest">
          {t("profile.rewards")}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-body text-xs font-medium ${tier.cls}`}>
          <span className="material-symbols-outlined text-[14px]">star</span>
          {t(tier.key)}
        </span>
      </div>

      <div>
        <span className="font-headline text-4xl tracking-tight text-text-primary">
          {points.toLocaleString()}
        </span>
        <span className="font-body text-sm text-text-muted ml-2">{t("profile.points")}</span>
      </div>

      {/* Progress to next tier */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-background overflow-hidden">
          <div
            className="h-full bg-primary rounded-full origin-left"
            style={{ width: `${pct}%`, transition: "width 0.6s var(--expo)" }}
          />
        </div>
        <p className="font-body text-xs text-text-muted">{footer}</p>
      </div>
    </div>
  );
}
