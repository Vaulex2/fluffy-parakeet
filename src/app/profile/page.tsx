import { redirect } from "next/navigation";
import Image from "next/image";
import { getUser, getProfile } from "@/lib/actions/auth";
import { getMyReservations } from "@/lib/actions/customer/reservations";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import CustomerReservations from "@/components/profile/CustomerReservations";

function LoyaltyBadge({ points }: { points: number }) {
  const tier =
    points >= 5000 ? { label: "Gold", cls: "text-amber-400 bg-amber-500/15 border-amber-500/30" }
    : points >= 1000 ? { label: "Silver", cls: "text-slate-300 bg-slate-500/15 border-slate-400/30" }
    : { label: "Bronze", cls: "text-orange-400 bg-orange-500/15 border-orange-500/30" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-body text-xs font-medium ${tier.cls}`}>
      <span className="material-symbols-outlined text-[14px]">star</span>
      {tier.label} · {points.toLocaleString()} pts
    </span>
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
  const [profile, { reservations, totalPages }] = await Promise.all([
    getProfile(),
    getMyReservations(page),
  ]);
  if (!profile) redirect("/auth/login");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* Suspension notice */}
      {profile.is_suspended && (
        <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5">warning</span>
          <div>
            <p className="font-body text-sm text-text-primary font-medium">Account Suspended</p>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Your account has been suspended. You can view your history but cannot place new orders or reservations. Contact support to appeal.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-5">
        {profile.avatar_url ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl">person</span>
          </div>
        )}
        <div>
          <h1 className="font-headline text-2xl tracking-tight text-text-primary">
            {profile.full_name ?? "My Account"}
          </h1>
          <p className="font-body text-sm text-text-muted mt-0.5">{user.email}</p>
          <div className="mt-2">
            <LoyaltyBadge points={profile.loyalty_points} />
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <section className="bg-surface border border-surface-border rounded-2xl p-6 space-y-5">
        <h2 className="font-headline text-lg tracking-tight text-text-primary">Edit Profile</h2>
        <ProfileEditForm profile={profile} />
      </section>

      {/* Reservations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg tracking-tight text-text-primary">My Reservations</h2>
          <a
            href="/reservations"
            className="text-primary hover:underline font-body text-sm"
          >
            + Book a table
          </a>
        </div>
        <CustomerReservations
          reservations={reservations}
          totalPages={totalPages}
          page={page}
        />
      </section>
    </div>
  );
}
