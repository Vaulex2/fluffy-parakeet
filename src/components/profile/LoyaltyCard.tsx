import type { ReactNode } from "react";

export interface Tier {
  label: string;
  /** classes for the small chip (text + bg + border) */
  cls: string;
  /** points where this tier starts */
  floor: number;
  /** points where the next tier starts, or null at the top */
  next: number | null;
  /** label of the next tier, or null at the top */
  nextLabel: string | null;
}

const BRONZE: Tier = { label: "Bronze", cls: "text-orange-400 bg-orange-500/15 border-orange-500/30", floor: 0, next: 1000, nextLabel: "Silver" };
const SILVER: Tier = { label: "Silver", cls: "text-slate-300 bg-slate-500/15 border-slate-400/30", floor: 1000, next: 5000, nextLabel: "Gold" };
const GOLD: Tier = { label: "Gold", cls: "text-amber-400 bg-amber-500/15 border-amber-500/30", floor: 5000, next: null, nextLabel: null };

export function tierFor(points: number): Tier {
  if (points >= 5000) return GOLD;
  if (points >= 1000) return SILVER;
  return BRONZE;
}

/** Small inline chip — reused in the profile hero. */
export function TierChip({ points }: { points: number }) {
  const tier = tierFor(points);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-body text-xs font-medium ${tier.cls}`}>
      <span className="material-symbols-outlined text-[14px]">star</span>
      {tier.label} · {points.toLocaleString()} pts
    </span>
  );
}

export default function LoyaltyCard({ points }: { points: number }) {
  const tier = tierFor(points);

  let pct = 100;
  let footer: ReactNode = "Top tier — thank you for being a regular!";
  if (tier.next !== null) {
    const span = tier.next - tier.floor;
    pct = Math.min(100, Math.max(0, Math.round(((points - tier.floor) / span) * 100)));
    const remaining = tier.next - points;
    footer = (
      <>
        <span className="text-text-primary font-medium">{remaining.toLocaleString()} pts</span> to {tier.nextLabel}
      </>
    );
  }

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs font-body font-medium uppercase tracking-widest">
          Rewards
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-body text-xs font-medium ${tier.cls}`}>
          <span className="material-symbols-outlined text-[14px]">star</span>
          {tier.label}
        </span>
      </div>

      <div>
        <span className="font-headline text-4xl tracking-tight text-text-primary">
          {points.toLocaleString()}
        </span>
        <span className="font-body text-sm text-text-muted ml-2">points</span>
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
