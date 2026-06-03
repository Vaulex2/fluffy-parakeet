"use client";

// Re-mounts on every navigation, so each page gets a subtle "served onto the
// belt" entrance. Honors reduced-motion (same matchMedia pattern as Reveal).
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { EXPO } from "@/components/ui/Reveal";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // The admin section animates its own content via app/admin/template.tsx, which
  // sits below the persistent sidebar. Skipping here keeps the sidebar from
  // flashing on every admin sub-navigation and avoids a double fade.
  if (pathname.startsWith("/admin")) return <>{children}</>;

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}
