"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { useCart } from "@/components/cart/CartContext";
import { createOrder } from "@/lib/actions/orders";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("pickup");
  const [points, setPoints] = useState(0); // loyalty balance (0 for guests)
  const [usePoints, setUsePoints] = useState(false);

  // Pre-fill from auth user on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      if (user.email && !email) setEmail(user.email);
      // Try to get profile for name/phone/loyalty balance
      supabase
        .from("profiles")
        .select("full_name, phone, loyalty_points")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name && !name) setName(data.full_name);
          if (data?.phone && !phone) setPhone(data.phone);
          if (typeof data?.loyalty_points === "number") setPoints(data.loyalty_points);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Points redemption: 1 pt = 1 UZS, min 100, max 50% of the order.
  const maxRedeemable = Math.min(points, Math.floor(total * 0.5));
  const canRedeem = maxRedeemable >= 100;
  const discount = usePoints && canRedeem ? maxRedeemable : 0;
  const payable = total - discount;

  if (items.length === 0 && !orderId) {
    return (
      <main className="flex-grow pt-[72px] min-h-screen bg-background bg-seigaiha relative flex items-center justify-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="text-center space-y-4 relative z-10">
          <span className="material-symbols-outlined text-5xl text-text-muted opacity-40 block">
            shopping_bag
          </span>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary">
            {t("checkout.emptyTitle")}
          </h2>
          <Link href="/menu" className="text-primary hover:underline font-body text-sm">
            {t("checkout.browseMenu")}
          </Link>
        </div>
      </main>
    );
  }

  if (orderId) {
    return (
      <main className="flex-grow pt-[72px] min-h-screen bg-background bg-seigaiha relative flex items-center justify-center px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="max-w-md w-full text-center space-y-6 relative z-10">
            {/* Animated success badge */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Burst dots */}
              {[0,45,90,135,180,225,270,315].map((deg) => (
                <span
                  key={deg}
                  className="burst-dot absolute w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ transform: `rotate(${deg}deg) translateY(-38px)`, transformOrigin: 'center 38px' }}
                />
              ))}
              {/* Ripple rings */}
              <span className="ring-ping absolute inset-0 rounded-full border border-green-500/60" />
              <span className="ring-ping-slow absolute inset-0 rounded-full border border-green-400/30" />
              {/* Icon circle */}
              <div className="check-pop relative w-20 h-20 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.25)]">
                <svg viewBox="0 0 52 52" className="w-10 h-10" fill="none">
                  <polyline
                    points="14,27 22,35 38,18"
                    stroke="#4ade80"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50"
                    className="draw-check"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="font-headline text-4xl tracking-tight text-text-primary mb-2">
                {t("checkout.placedTitle")}
              </h2>
              <p className="text-text-muted font-body text-sm">
                {t("checkout.orderNumber", { id: orderId.slice(0, 8).toUpperCase() })}
              </p>
            </div>
            <div className="bg-surface border border-surface-border rounded-xl p-5 text-left space-y-2">
              <p className="text-text-muted font-body text-sm">
                {t("checkout.type")} <span className="text-text-primary font-medium">{t(`orderType.${orderType}`)}</span>
              </p>
              {address && (
                <p className="text-text-muted font-body text-sm">
                  {t("checkout.address")} <span className="text-text-primary font-medium">{address}</span>
                </p>
              )}
              <p className="text-text-muted font-body text-sm">
                {t("checkout.total")} <span className="text-primary font-headline text-xl">{formatPrice(confirmedTotal)}</span>
              </p>
            </div>
            <p className="text-text-muted font-body text-sm">
              {t("checkout.questions")}{" "}
              <a href="tel:+998901234567" className="text-primary">+998 90 123 45 67</a>
            </p>
            <Link
              href="/menu"
              className="inline-block bg-primary text-white font-headline tracking-tight text-lg px-8 py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              {t("checkout.orderAgain")}
            </Link>
          </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (orderType === "delivery" && !address.trim()) {
      setError(t("checkout.addressError"));
      return;
    }
    startTransition(async () => {
      const result = await createOrder(
        {
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          order_type: orderType,
          delivery_address: orderType === "delivery" ? address : null,
          total_amount: total,
          notes: notes || null,
        },
        items.map((i) => ({
          order_id: "",
          menu_item_id: i.id,
          item_name: i.name,
          quantity: i.quantity,
          unit_price: i.price_uzs,
          subtotal: i.price_uzs * i.quantity,
        })),
        discount // points to redeem (1 pt = 1 UZS); ignored for guests server-side
      );
      if (result.success) {
        setConfirmedTotal(payable);
        clearCart();
        setOrderId(result.id);
        // Points balance changed — refresh server components (incl. the navbar
        // in cached layouts) so the loyalty chip isn't stale.
        if (discount > 0) router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <main className="flex-grow pt-[72px] min-h-screen bg-background bg-seigaiha relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="font-headline text-3xl tracking-tight text-text-primary">
              {t("checkout.yourOrder")}
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-surface border border-surface-border rounded-xl p-4"
                >
                  {item.image_url && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-text-primary font-body text-sm font-medium">{item.name}</p>
                    <p className="text-text-muted font-body text-xs">
                      {formatPrice(item.price_uzs)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-text-primary font-body text-sm font-semibold self-center">
                    {formatPrice(item.price_uzs * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            {/* Loyalty points redemption (signed-in users with enough points) */}
            {canRedeem && (
              <button
                type="button"
                onClick={() => setUsePoints((v) => !v)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors text-left ${
                  usePoints
                    ? "border-primary bg-primary/10"
                    : "border-surface-border hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">loyalty</span>
                  <span>
                    <span className="block font-body text-sm text-text-primary">
                      {t("checkout.usePoints")}
                    </span>
                    <span className="block font-body text-xs text-text-muted">
                      {t("checkout.pointsAvailable", { points: points.toLocaleString() })}
                    </span>
                  </span>
                </span>
                <span
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                    usePoints ? "bg-primary" : "bg-surface-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      usePoints ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            )}

            <div className="space-y-2 border-t border-surface-border pt-4">
              {discount > 0 && (
                <>
                  <div className="flex items-center justify-between font-body text-sm">
                    <span className="text-text-muted">{t("checkout.totalLabel")}</span>
                    <span className="text-text-muted">{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between font-body text-sm">
                    <span className="text-amber-400">{t("checkout.pointsDiscount")}</span>
                    <span className="text-amber-400">{t("checkout.pointsOff", { amount: discount.toLocaleString() })}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-text-muted font-body">{t("checkout.totalLabel")}</span>
                <span className="text-primary font-headline text-2xl">{formatPrice(payable)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <h2 className="font-headline text-3xl tracking-tight text-text-primary">
              {t("checkout.yourDetails")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label={t("checkout.fullName")}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t("checkout.namePlaceholder")}
                  className={inputCls}
                />
              </Field>
              <Field label={t("checkout.phone")}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={t("checkout.phonePlaceholder")}
                  className={inputCls}
                />
              </Field>
              <Field label={t("checkout.emailReceipt")}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("checkout.emailPlaceholder")}
                  className={inputCls}
                />
              </Field>

              <Field label={t("checkout.orderType")}>
                <div className="flex gap-3">
                  {(["pickup", "delivery"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-2.5 rounded-xl border font-body text-sm transition-colors ${
                        orderType === type
                          ? "bg-primary border-primary text-white"
                          : "border-surface-border text-text-muted hover:border-primary/60"
                      }`}
                    >
                      {t(`orderType.${type}`)}
                    </button>
                  ))}
                </div>
              </Field>

              {orderType === "delivery" && (
                <Field label={t("checkout.deliveryAddress")}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("checkout.addressPlaceholder")}
                    className={inputCls}
                  />
                </Field>
              )}

              <Field label={t("checkout.notes")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("checkout.notesPlaceholder")}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {error && (
                <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? t("checkout.placingOrder") : t("checkout.placeOrder")}
              </button>
            </form>
          </div>
        </div>
    </main>
  );
}

const inputCls =
  "w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
