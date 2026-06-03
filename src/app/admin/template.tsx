"use client";

// Scoped to the /admin segment: lives below admin/layout.tsx, so it wraps only
// the page content — the sidebar stays fixed. Re-mounts on every admin
// navigation for a subtle, snappy content transition. Honors reduced-motion
// (same matchMedia pattern as the root template / Reveal).
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EXPO } from "@/components/ui/Reveal";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}
