"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Shared premium easing curve — mirrors --expo in globals.css. */
export const EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  /** Seconds of delay before the reveal starts — used to stagger siblings. */
  delay?: number;
  /** Vertical offset (px) the content rises from. */
  y?: number;
  className?: string;
}

/**
 * Scroll-triggered reveal. Wraps server-rendered children so they fade + rise
 * into view once, the first time they enter the viewport. Honors the user's
 * reduced-motion preference (same matchMedia pattern as SpotlightRotator).
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: RevealProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}
