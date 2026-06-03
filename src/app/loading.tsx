import KaitenSpinner from "@/components/ui/KaitenSpinner";

// Global Suspense fallback for any route that doesn't define its own loading.tsx.
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-seigaiha">
      <KaitenSpinner size="lg" label="Plating your page…" />
    </div>
  );
}
