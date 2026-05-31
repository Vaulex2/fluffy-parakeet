# Sushi GO — Design System

## 1. Brand
Sushi cafe in Namangan, Uzbekistan. Japanese aesthetic meets Central Asian warmth. Dark, editorial, premium feel.

## 2. Colors
- **Background:** `#0B0B0B` (ink black)
- **Primary accent:** `#E11D2A` (brand red)
- **Cream:** `#F4ECD8` (primary text + light section bg)
- **Surface:** `rgba(244,236,216,0.04)` bg + `rgba(244,236,216,0.08)` border
- **Muted text:** `rgba(244,236,216,0.55)`
- **Frosted overlay:** `rgba(11,11,11,0.85)` + backdrop-filter blur

## 3. Typography
- **Display:** Anton — tight tracking `-0.03em`, line-height `0.95`
- **Body:** Manrope 300–800 — line-height `1.7`, max `65–75ch`
- **Decorative:** Caveat Brush — for script accents

## 4. Depth System
- Base → Elevated card → Floating overlay
- Cards lift `translateY(-6px)` on hover
- Shadows are layered and color-tinted (red tint at low opacity)

## 5. Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — ease-out expo
- Animate `transform` and `opacity` only
- Never `transition-all`

## 6. Design System Notes for Stitch Generation

**COLORS:** Background #0B0B0B, primary red #E11D2A, cream text #F4ECD8, muted rgba(244,236,216,0.55). Light sections use cream #F4ECD8 background with dark #0B0B0B text.

**FONTS:** Anton for all headlines (tight tracking, compressed), Manrope for body (generous line-height). Caveat Brush for decorative script text.

**CARDS:** Dark surface rgba(244,236,216,0.04), 1px rgba(244,236,216,0.08) border, 12px radius. Hover: lift + deeper shadow with red tint.

**BUTTONS:** Primary = solid red #E11D2A, cream text, lifts on hover. Ghost = transparent with cream border, fills subtly on hover.

**PATTERNS:** Seigaiha (Japanese overlapping wave scales) SVG at 6% opacity on dark sections. Radial gradient glows: red top-left, cream bottom-right.

**IMAGES:** Dark gradient overlay (linear-gradient to top, black/60), mix-blend-multiply color layer. Food photography with warm/dramatic treatment.

**TAGS/BADGES:** `rgba(225,29,42,0.15)` bg, red text, uppercase, tight letter-spacing, small rounded rect.
