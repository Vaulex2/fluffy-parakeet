// Branded loading spinner: a static sushi plate with a ring of toppings that
// orbit on the conveyor (reuses the kaiten-spin keyframe from globals.css,
// just faster). Pure CSS — reduced-motion is handled by .kaiten-loader.

const SIZES = { sm: 44, md: 72, lg: 104 } as const;

// Six toppings evenly spaced (60° apart), 38% radius — same geometry as KaitenRing.
const TOPPINGS = 6;
const RADIUS = 38; // percent of the plate, from center

export default function KaitenSpinner({
  size = "md",
  label,
}: {
  size?: keyof typeof SIZES;
  label?: string;
}) {
  const px = SIZES[size];
  const dot = px * 0.16;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: px, height: px }}>
        {/* Static plate + inner accent ring */}
        <div className="absolute inset-0 rounded-full border border-surface-border bg-surface" />
        <div className="absolute inset-[16%] rounded-full border border-primary/30" />

        {/* Orbiting toppings */}
        <div className="kaiten-loader absolute inset-0">
          {Array.from({ length: TOPPINGS }).map((_, i) => {
            const angle = ((360 / TOPPINGS) * i - 90) * (Math.PI / 180);
            const left = 50 + RADIUS * Math.cos(angle);
            const top = 50 + RADIUS * Math.sin(angle);
            return (
              <span
                key={i}
                className={`absolute rounded-full ${
                  i % 2 === 0 ? "bg-primary" : "bg-text-primary/80"
                }`}
                style={{
                  width: dot,
                  height: dot,
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>

        {/* Center emblem (static) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-headline text-primary leading-none"
            style={{ fontSize: px * 0.34 }}
          >
            鮨
          </span>
        </div>
      </div>

      {label && (
        <p className="font-body text-text-muted text-sm tracking-wide">{label}</p>
      )}
    </div>
  );
}
