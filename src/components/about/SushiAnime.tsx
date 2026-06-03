"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EXPO } from "@/components/ui/Reveal";

/* ---------- helpers ---------- */

function starPath(s: number) {
  const i = s * 0.22;
  return `M 0 ${-s} L ${i} ${-i} L ${s} 0 L ${i} ${i} L 0 ${s} L ${-i} ${i} L ${-s} 0 L ${-i} ${-i} Z`;
}

const SPARKLES = [
  { x: 118, y: 120, delay: 0.0, size: 14 },
  { x: 392, y: 96, delay: 0.6, size: 11 },
  { x: 432, y: 232, delay: 1.2, size: 13 },
  { x: 86, y: 250, delay: 1.7, size: 10 },
  { x: 360, y: 360, delay: 0.9, size: 12 },
  { x: 150, y: 372, delay: 1.4, size: 9 },
];

// speed-line burst: 18 rays from the nigiri centre
const RAYS = Array.from({ length: 18 }, (_, i) => (i * 360) / 18);
const CX = 250;
const CY = 300;

/* ---------- component ---------- */

export default function SushiAnime() {
  const [rm, setRm] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setRm(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // shared blink keyframes (long open, quick double-blink)
  const blink = rm
    ? undefined
    : {
        animate: { scaleY: [1, 1, 0.1, 1, 1, 0.1, 1] },
        transition: {
          duration: 5,
          times: [0, 0.78, 0.82, 0.86, 0.9, 0.94, 1],
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      {/* Pulsing glow */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-primary/25 blur-[90px] pointer-events-none"
        animate={rm ? undefined : { opacity: [0.3, 0.65, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={rm ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 500 500"
        className="relative z-10 w-full max-w-[480px]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* clip the gloss sweep to the salmon surface */}
          <clipPath id="salmonClip">
            <path d="M 92 296 C 92 214 168 176 250 176 C 332 176 412 212 432 286 C 442 322 408 338 372 322 C 336 308 290 312 250 312 C 210 312 162 314 128 326 C 96 338 82 330 92 296 Z" />
          </clipPath>
          <linearGradient id="riceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF6E9" />
            <stop offset="100%" stopColor="#E8DCBE" />
          </linearGradient>
          <linearGradient id="salmonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9E73" />
            <stop offset="55%" stopColor="#F0845A" />
            <stop offset="100%" stopColor="#D9663E" />
          </linearGradient>
        </defs>

        {/* faint kanji backdrop */}
        <text
          x="250" y="300" textAnchor="middle" dominantBaseline="middle"
          fontSize="360" fill="#E11D2A" opacity="0.05"
        >
          鮨
        </text>

        {/* speed-line burst */}
        <motion.g
          animate={rm ? undefined : { opacity: [0.04, 0.2, 0.04], rotate: [0, 6, 0] }}
          transition={rm ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {RAYS.map((deg) => {
            const r = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={CX + Math.cos(r) * 120} y1={CY + Math.sin(r) * 120}
                x2={CX + Math.cos(r) * 430} y2={CY + Math.sin(r) * 430}
                stroke="#E11D2A" strokeWidth="2.5" strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* rising steam */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={
              i === 0
                ? "M 210 230 C 196 200 224 188 210 158 C 198 132 224 118 212 92"
                : i === 1
                ? "M 252 224 C 240 192 268 180 254 148 C 242 120 268 106 256 78"
                : "M 296 230 C 284 202 310 190 298 160 C 288 136 310 122 300 98"
            }
            fill="none"
            stroke="#F4ECD8"
            strokeWidth="6"
            strokeLinecap="round"
            animate={
              rm
                ? { opacity: 0.18 }
                : { opacity: [0, 0.35, 0], y: [10, -28, -48], pathLength: [0.3, 1, 0.6] }
            }
            transition={
              rm
                ? undefined
                : { duration: 3.6, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }
            }
          />
        ))}

        {/* ===== floating nigiri character ===== */}
        <motion.g
          initial={rm ? undefined : { opacity: 0, scale: 0.8, y: 20 }}
          animate={
            rm
              ? undefined
              : { opacity: 1, scale: 1, y: [0, -16, 0], rotate: [0, -2, 0, 2, 0] }
          }
          transition={
            rm
              ? undefined
              : {
                  opacity: { duration: 0.7, ease: EXPO },
                  scale: { duration: 0.7, ease: EXPO },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                }
          }
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* contact shadow */}
          <ellipse cx="250" cy="392" rx="118" ry="20" fill="#000" opacity="0.28" />

          {/* rice base */}
          <path
            d="M 96 350 C 96 300 158 282 250 282 C 342 282 404 300 404 350 C 404 384 330 398 250 398 C 170 398 96 384 96 350 Z"
            fill="url(#riceGrad)" stroke="#0B0B0B" strokeWidth="6" strokeLinejoin="round"
          />
          {/* individual rice grain hints */}
          <g stroke="#D8C9A4" strokeWidth="3" strokeLinecap="round" opacity="0.7">
            <line x1="150" y1="360" x2="168" y2="360" />
            <line x1="196" y1="372" x2="214" y2="372" />
            <line x1="252" y1="376" x2="270" y2="376" />
            <line x1="308" y1="370" x2="326" y2="370" />
            <line x1="340" y1="356" x2="358" y2="356" />
          </g>

          {/* salmon */}
          <path
            d="M 92 296 C 92 214 168 176 250 176 C 332 176 412 212 432 286 C 442 322 408 338 372 322 C 336 308 290 312 250 312 C 210 312 162 314 128 326 C 96 338 82 330 92 296 Z"
            fill="url(#salmonGrad)" stroke="#0B0B0B" strokeWidth="6" strokeLinejoin="round"
          />
          {/* salmon marbling lines */}
          <g clipPath="url(#salmonClip)" stroke="#FFD9C4" strokeWidth="5" fill="none" opacity="0.6" strokeLinecap="round">
            <path d="M 150 250 C 200 232 260 236 320 248" />
            <path d="M 140 280 C 200 266 270 270 340 282" />
          </g>
          {/* cel-shade shadow on the right */}
          <path
            d="M 330 300 C 360 306 400 320 432 286 C 442 322 408 338 372 322 C 352 314 332 306 330 300 Z"
            clipPath="url(#salmonClip)" fill="#A83820" opacity="0.45"
          />

          {/* moving gloss sweep */}
          <g clipPath="url(#salmonClip)">
            <motion.rect
              x="-160" y="150" width="120" height="220"
              fill="white" opacity="0.4" transform="skewX(-20)"
              animate={rm ? undefined : { x: [-160, 560] }}
              transition={
                rm
                  ? undefined
                  : { duration: 3.2, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }
              }
            />
          </g>

          {/* ----- kawaii face ----- */}
          {/* blush cheeks */}
          <ellipse cx="190" cy="268" rx="17" ry="10" fill="#E11D2A" opacity="0.3" />
          <ellipse cx="312" cy="268" rx="17" ry="10" fill="#E11D2A" opacity="0.3" />

          {/* eyes (blink) */}
          <motion.ellipse
            cx="206" cy="248" rx="11" ry="15" fill="#0B0B0B"
            style={{ transformOrigin: "206px 248px" }}
            {...(blink ?? {})}
          />
          <motion.ellipse
            cx="294" cy="248" rx="11" ry="15" fill="#0B0B0B"
            style={{ transformOrigin: "294px 248px" }}
            {...(blink ?? {})}
          />
          {/* eye glints */}
          <circle cx="210" cy="242" r="4" fill="white" />
          <circle cx="298" cy="242" r="4" fill="white" />

          {/* smile */}
          <path
            d="M 232 268 Q 250 284 268 268"
            fill="none" stroke="#0B0B0B" strokeWidth="5" strokeLinecap="round"
          />
        </motion.g>

        {/* ===== orbiting maki buddies ===== */}
        <motion.g
          animate={rm ? undefined : { rotate: 360 }}
          transition={rm ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {[0, 1].map((i) => {
            const angle = (i * 180 - 40) * (Math.PI / 180);
            const rad = 188;
            const x = CX + Math.cos(angle) * rad;
            const y = CY + Math.sin(angle) * rad;
            const fill = i === 0 ? "#E11D2A" : "#F0845A";
            return (
              // counter-rotate keeps each buddy upright
              <motion.g
                key={i}
                animate={rm ? undefined : { rotate: -360 }}
                transition={rm ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                <circle cx={x} cy={y} r="26" fill="#1C1C10" stroke="#0B0B0B" strokeWidth="4" />
                <circle cx={x} cy={y} r="19" fill="#F4ECD8" />
                <circle cx={x} cy={y} r="9" fill={fill} />
                <ellipse cx={x - 8} cy={y - 8} rx="6" ry="4" transform={`rotate(-20 ${x - 8} ${y - 8})`} fill="white" opacity="0.35" />
              </motion.g>
            );
          })}
        </motion.g>

        {/* ===== kira sparkles ===== */}
        {SPARKLES.map((s) => (
          <motion.g
            key={`${s.x}-${s.y}`}
            transform={`translate(${s.x} ${s.y})`}
            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
            animate={rm ? undefined : { scale: [0, 1.4, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] }}
            transition={
              rm
                ? undefined
                : { duration: 2, repeat: Infinity, delay: s.delay, ease: "easeInOut" }
            }
          >
            <path d={starPath(s.size)} fill="#E11D2A" />
            <path d={starPath(s.size * 0.45)} fill="#FFFFFF" opacity="0.9" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
