#!/usr/bin/env python3
"""Generate Upwork proposal PDF for web development job."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line, Polygon
from reportlab.graphics import renderPDF
import math

# ── Brand colors ──────────────────────────────────────────────────────────────
INK        = HexColor("#0B0B0B")
RED        = HexColor("#E11D2A")
RED_DARK   = HexColor("#B91220")
RED_LIGHT  = HexColor("#FF3344")
CREAM      = HexColor("#F4ECD8")
CREAM_DARK = HexColor("#E8DFC8")
SURFACE    = HexColor("#141414")
SURFACE2   = HexColor("#1C1C1C")
BORDER     = HexColor("#2A2A2A")
TEXT_MUTED = HexColor("#888888")
TEXT_DIM   = HexColor("#AAAAAA")
GREEN      = HexColor("#22C55E")
AMBER      = HexColor("#F59E0B")
BLUE       = HexColor("#3B82F6")
W          = white
B          = black

PAGE_W, PAGE_H = A4  # 595.27 x 841.89 pts

# ── Helper: draw rounded rect ─────────────────────────────────────────────────
def rrect(c, x, y, w, h, r, fill, stroke=None, sw=0):
    c.saveState()
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1 if stroke else 0)
    c.restoreState()

def pill(c, x, y, w, h, fill, text, text_color=white, font="Helvetica-Bold", fs=7):
    rrect(c, x, y, w, h, h/2, fill)
    c.saveState()
    c.setFillColor(text_color)
    c.setFont(font, fs)
    c.drawCentredString(x + w/2, y + h/2 - fs*0.35, text)
    c.restoreState()

def label(c, x, y, text, color=TEXT_MUTED, fs=7, font="Helvetica"):
    c.saveState()
    c.setFillColor(color)
    c.setFont(font, fs)
    c.drawString(x, y, text)
    c.restoreState()

def heading(c, x, y, text, fs=14, color=white, font="Helvetica-Bold"):
    c.saveState()
    c.setFillColor(color)
    c.setFont(font, fs)
    c.drawString(x, y, text)
    c.restoreState()

def body_text(c, x, y, text, fs=8.5, color=TEXT_DIM, font="Helvetica", max_width=None):
    c.saveState()
    c.setFillColor(color)
    c.setFont(font, fs)
    if max_width:
        # Simple word wrap
        words = text.split()
        lines = []
        line = ""
        for w in words:
            test = (line + " " + w).strip()
            if c.stringWidth(test, font, fs) <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        for i, ln in enumerate(lines):
            c.drawString(x, y - i * (fs + 2), ln)
    else:
        c.drawString(x, y, text)
    c.restoreState()

# ── Cover page ────────────────────────────────────────────────────────────────
def draw_cover(c):
    # Full dark background
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Top red accent bar
    c.setFillColor(RED)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    # Decorative seigaiha-style circles (top right)
    c.saveState()
    c.setFillColor(HexColor("#1A0305"))
    c.setStrokeColor(HexColor("#2D0608"))
    c.setLineWidth(0.5)
    for row in range(8):
        for col in range(6):
            cx = PAGE_W - 60 + col * 44 - (row % 2) * 22
            cy = PAGE_H - 120 + row * 22
            r = 26
            c.arc(cx - r, cy - r, cx + r, cy + r, 0, 180)
    c.restoreState()

    # Red glow blob
    c.saveState()
    from reportlab.lib.colors import Color
    # Simulate glow with concentric circles of decreasing opacity
    glow_x, glow_y = 90, PAGE_H - 380
    for i in range(8, 0, -1):
        alpha = 0.025 * i
        c.setFillColor(Color(0.882, 0.114, 0.165, alpha=alpha))
        r = i * 28
        c.circle(glow_x, glow_y, r, fill=1, stroke=0)
    c.restoreState()

    # Left accent line
    c.setFillColor(RED)
    c.rect(48, PAGE_H * 0.28, 3, PAGE_H * 0.44, fill=1, stroke=0)

    # UPWORK tag
    pill(c, 60, PAGE_H - 72, 90, 18, RED, "UPWORK PROPOSAL", white, "Helvetica-Bold", 7)

    # Main headline
    c.saveState()
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 42)
    c.drawString(60, PAGE_H - 140, "Full-Stack")
    c.setFillColor(RED)
    c.drawString(60, PAGE_H - 188, "Restaurant")
    c.setFillColor(white)
    c.drawString(60, PAGE_H - 236, "Platform")
    c.restoreState()

    # Subtitle
    c.saveState()
    c.setFillColor(TEXT_DIM)
    c.setFont("Helvetica", 11)
    c.drawString(60, PAGE_H - 268, "Modern web development · Next.js · Supabase · Multi-language")
    c.restoreState()

    # Divider
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(60, PAGE_H - 290, PAGE_W - 60, PAGE_H - 290)

    # Project name card
    rrect(c, 60, PAGE_H - 390, PAGE_W - 120, 80, 10, SURFACE2, BORDER, 0.7)
    label(c, 80, PAGE_H - 320, "PROJECT", TEXT_MUTED, 7, "Helvetica-Bold")
    heading(c, 80, PAGE_H - 338, "SushiGO", 22, RED)
    body_text(c, 80, PAGE_H - 358, "Sushi cafe platform · Namangan, Uzbekistan", 9.5, TEXT_DIM)
    label(c, 80, PAGE_H - 374, "Live at: fluffy-parakeet-topaz.vercel.app", TEXT_MUTED, 7.5)

    # Stats row
    stats = [
        ("10+", "Pages Built"),
        ("3", "Languages"),
        ("5", "Admin Panels"),
        ("∞", "Scalable"),
    ]
    sw = (PAGE_W - 120) / len(stats)
    for i, (val, lbl) in enumerate(stats):
        bx = 60 + i * sw
        rrect(c, bx + 4, PAGE_H - 490, sw - 8, 68, 8, SURFACE2, BORDER, 0.5)
        c.saveState()
        c.setFillColor(RED)
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(bx + sw/2, PAGE_H - 448, val)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7.5)
        c.drawCentredString(bx + sw/2, PAGE_H - 462, lbl)
        c.restoreState()

    # Tech stack pills
    label(c, 60, PAGE_H - 510, "TECH STACK", TEXT_MUTED, 7, "Helvetica-Bold")
    techs = ["Next.js 14", "TypeScript", "Supabase", "Tailwind CSS", "PostgreSQL", "Resend API"]
    tx = 60
    for t in techs:
        tw = c.stringWidth(t, "Helvetica-Bold", 7.5) + 18
        rrect(c, tx, PAGE_H - 532, tw, 16, 8, SURFACE2, BORDER, 0.7)
        c.saveState()
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(tx + 9, PAGE_H - 527.5, t)
        c.restoreState()
        tx += tw + 6

    # Proposal intro text
    intro = (
        "I have built a complete, production-ready restaurant platform from the ground up — covering "
        "everything from an animated consumer storefront and multi-language support to a fully-featured "
        "admin dashboard. Below you will find a detailed breakdown of every feature I delivered, "
        "along with live links so you can explore the work yourself."
    )
    c.saveState()
    c.setFillColor(TEXT_DIM)
    c.setFont("Helvetica", 9)
    tw_max = PAGE_W - 120
    words = intro.split()
    lines, line = [], ""
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, "Helvetica", 9) <= tw_max:
            line = test
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    for i, ln in enumerate(lines):
        c.drawString(60, PAGE_H - 558 - i * 13, ln)
    c.restoreState()

    # Author block at bottom
    rrect(c, 60, 48, PAGE_W - 120, 54, 8, SURFACE2, BORDER, 0.5)
    c.saveState()
    # Red dot
    c.setFillColor(RED)
    c.circle(84, 77, 5, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(98, 80, "Full-Stack Web Developer")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(98, 66, "Next.js · React · Supabase · TypeScript · Tailwind CSS")
    c.drawString(98, 56, "Available for immediate start · Delivered on schedule")
    c.restoreState()

    # Page indicator
    c.saveState()
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(PAGE_W / 2, 28, "1 / 4")
    c.restoreState()


# ── Page 2: Features overview ─────────────────────────────────────────────────
def draw_page2(c):
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    # Page header
    label(c, 60, PAGE_H - 36, "SUSHIGO PLATFORM  ·  FEATURE BREAKDOWN", TEXT_MUTED, 7, "Helvetica-Bold")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(60, PAGE_H - 44, PAGE_W - 60, PAGE_H - 44)

    heading(c, 60, PAGE_H - 72, "What I Built", 22, white)
    body_text(c, 60, PAGE_H - 88, "A complete full-stack solution with consumer-facing storefront and operator admin dashboard.", 9, TEXT_DIM)

    # Feature cards — 2 columns
    features = [
        {
            "icon": "◉", "color": RED, "title": "Hero & Storefront",
            "items": [
                "Animated hero with kaiten ring visual",
                "Marquee banner for announcements",
                "Featured dishes showcase",
                "About section with chef spotlight",
                "Reservation call-to-action block",
            ]
        },
        {
            "icon": "⊞", "color": BLUE, "title": "Menu & Cart",
            "items": [
                "Category-filtered menu grid",
                "Real-time availability checks",
                "Item detail modal with images",
                "Fly-to-cart animation on add",
                "Persistent cart drawer (Context API)",
            ]
        },
        {
            "icon": "◷", "color": GREEN, "title": "Reservations System",
            "items": [
                "Table booking form with time slots",
                "PostgreSQL EXCLUDE constraint (no double-booking)",
                "Guest management tokens (manage/cancel via email link)",
                "Admin calendar view",
                "Status workflow: pending → confirmed → completed",
            ]
        },
        {
            "icon": "◈", "color": AMBER, "title": "Orders & Checkout",
            "items": [
                "Pickup & delivery order types",
                "Loyalty points redemption at checkout",
                "Animated success confirmation screen",
                "Order history with live status updates",
                "Auto-fill from auth profile",
            ]
        },
        {
            "icon": "◎", "color": HexColor("#A855F7"), "title": "Auth & Profiles",
            "items": [
                "Email/password signup & login",
                "Google OAuth integration",
                "Forgot / reset password flows",
                "Editable profile with avatar",
                "Loyalty points balance display",
            ]
        },
        {
            "icon": "◆", "color": HexColor("#06B6D4"), "title": "Admin Dashboard",
            "items": [
                "Real-time KPI cards (revenue, orders, tables)",
                "Menu CRUD with sold-today counter",
                "Reservation calendar & status updates",
                "Live order feed",
                "User management panel",
                "Table availability management",
            ]
        },
    ]

    col_w = (PAGE_W - 130) / 2
    card_h = 130
    gap = 10
    start_y = PAGE_H - 112

    for i, feat in enumerate(features):
        col = i % 2
        row = i // 2
        x = 60 + col * (col_w + 10)
        y = start_y - row * (card_h + gap)

        rrect(c, x, y - card_h, col_w, card_h, 8, SURFACE2, BORDER, 0.5)

        # Colored left accent
        rrect(c, x, y - card_h, 3, card_h, 2, feat["color"])

        # Icon + title
        c.saveState()
        c.setFillColor(feat["color"])
        c.setFont("Helvetica-Bold", 13)
        c.drawString(x + 14, y - 22, feat["icon"])
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 30, y - 22, feat["title"])
        c.restoreState()

        # Divider
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.line(x + 14, y - 30, x + col_w - 14, y - 30)

        # Bullet items
        for j, item in enumerate(feat["items"]):
            iy = y - 44 - j * 16
            if iy < y - card_h + 8:
                break
            c.saveState()
            c.setFillColor(feat["color"])
            c.setFont("Helvetica-Bold", 6)
            c.drawString(x + 14, iy, "▸")
            c.setFillColor(TEXT_DIM)
            c.setFont("Helvetica", 7.5)
            # truncate if needed
            txt = item
            max_w = col_w - 40
            while c.stringWidth(txt, "Helvetica", 7.5) > max_w and len(txt) > 10:
                txt = txt[:-4] + "…"
            c.drawString(x + 23, iy, txt)
            c.restoreState()

    # Page footer
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.4)
    c.line(60, 38, PAGE_W - 60, 38)
    c.saveState()
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(60, 26, "SushiGO · Full-Stack Restaurant Platform")
    c.drawRightString(PAGE_W - 60, 26, "2 / 4")
    c.restoreState()


# ── Page 3: Tech stack + i18n + design ───────────────────────────────────────
def draw_page3(c):
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    label(c, 60, PAGE_H - 36, "SUSHIGO PLATFORM  ·  TECHNICAL HIGHLIGHTS", TEXT_MUTED, 7, "Helvetica-Bold")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(60, PAGE_H - 44, PAGE_W - 60, PAGE_H - 44)

    heading(c, 60, PAGE_H - 72, "Technical Excellence", 22, white)

    # ── Architecture diagram strip ────────────────────────────────────────────
    arch_y = PAGE_H - 100
    arch_h = 56
    cols_arch = [
        ("Browser", "React / Next.js\nClient Components", BLUE),
        ("App Router", "Server Components\nServer Actions", RED),
        ("Supabase", "Auth · DB · Storage\nReal-time", GREEN),
        ("Resend", "Email\nTransactional", AMBER),
    ]
    aw = (PAGE_W - 120) / len(cols_arch)
    for i, (title, sub, col) in enumerate(cols_arch):
        ax = 60 + i * aw
        rrect(c, ax + 3, arch_y - arch_h, aw - 6, arch_h, 8, SURFACE2, col, 0.8)
        c.saveState()
        c.setFillColor(col)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(ax + aw/2, arch_y - 20, title)
        c.setFillColor(TEXT_DIM)
        c.setFont("Helvetica", 7)
        for j, line in enumerate(sub.split("\n")):
            c.drawCentredString(ax + aw/2, arch_y - 34 - j * 10, line)
        c.restoreState()
        # Arrow connector
        if i < len(cols_arch) - 1:
            cx_mid = ax + aw - 3
            c.saveState()
            c.setFillColor(BORDER)
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.8)
            mid_y = arch_y - arch_h / 2
            c.line(cx_mid, mid_y, cx_mid + 6, mid_y)
            c.restoreState()

    # ── Three feature columns ─────────────────────────────────────────────────
    cols3 = [
        {
            "title": "Internationalization",
            "color": HexColor("#A855F7"),
            "items": [
                ("3 Languages", "Uzbek, English, Russian"),
                ("Cookie-based", "No URL routing needed"),
                ("DB content", "name_uz / name_ru / name_en columns"),
                ("Type-safe", "satisfies guard fails build on missing key"),
                ("Server + Client", "getT() / useLanguage() hooks"),
            ]
        },
        {
            "title": "Design System",
            "color": RED,
            "items": [
                ("Dark-first", "data-theme=\"dark\" strategy"),
                ("CSS tokens", "--sg-ink, --sg-red, --sg-cream"),
                ("Typography", "Anton (display) · Manrope (body)"),
                ("Animations", "transform + opacity only, expo easing"),
                ("Seigaiha BG", "Japanese wave pattern CSS motif"),
            ]
        },
        {
            "title": "Security & Auth",
            "color": GREEN,
            "items": [
                ("Middleware", "Session refresh on every request"),
                ("Route guard", "Protected pages redirect to login"),
                ("Role-based", "admin role enforced server-side"),
                ("Google OAuth", "One-click social sign-in"),
                ("Server Actions", "Mutations never exposed as API routes"),
            ]
        },
    ]

    cw3 = (PAGE_W - 130) / 3
    start3_y = PAGE_H - 172
    card3_h = 196

    for i, col in enumerate(cols3):
        cx = 60 + i * (cw3 + 5)
        rrect(c, cx, start3_y - card3_h, cw3, card3_h, 8, SURFACE2, BORDER, 0.5)
        rrect(c, cx, start3_y - card3_h, cw3, 3, 2, col["color"])

        c.saveState()
        c.setFillColor(col["color"])
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(cx + 12, start3_y - 20, col["title"])
        c.restoreState()

        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.line(cx + 12, start3_y - 28, cx + cw3 - 12, start3_y - 28)

        for j, (key, val) in enumerate(col["items"]):
            iy = start3_y - 42 - j * 30
            c.saveState()
            c.setFillColor(col["color"])
            c.setFont("Helvetica-Bold", 7.5)
            c.drawString(cx + 12, iy, key)
            c.setFillColor(TEXT_DIM)
            c.setFont("Helvetica", 7)
            max_w2 = cw3 - 24
            txt = val
            while c.stringWidth(txt, "Helvetica", 7) > max_w2 and len(txt) > 4:
                txt = txt[:-4] + "…"
            c.drawString(cx + 12, iy - 11, txt)
            c.restoreState()

    # ── Admin dashboard mockup ────────────────────────────────────────────────
    mock_y = start3_y - card3_h - 18
    mock_h = 200
    rrect(c, 60, mock_y - mock_h, PAGE_W - 120, mock_h, 10, SURFACE, BORDER, 0.7)

    # Window chrome
    rrect(c, 60, mock_y - 24, PAGE_W - 120, 24, 10, SURFACE2, BORDER, 0.7)
    c.saveState()
    c.setFillColor(HexColor("#FF5F57"))
    c.circle(78, mock_y - 12, 4, fill=1, stroke=0)
    c.setFillColor(HexColor("#FEBC2E"))
    c.circle(92, mock_y - 12, 4, fill=1, stroke=0)
    c.setFillColor(HexColor("#28C840"))
    c.circle(106, mock_y - 12, 4, fill=1, stroke=0)
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(PAGE_W / 2, mock_y - 16, "Admin Dashboard  ·  SushiGO")
    c.restoreState()

    # Dashboard content
    db_y = mock_y - 30
    # KPI cards
    kpis = [
        ("TODAY'S RESERVATIONS", "12", GREEN),
        ("PENDING ORDERS", "5", AMBER),
        ("REVENUE TODAY", "890,000 UZS", RED),
        ("TABLES ACTIVE", "8", BLUE),
    ]
    kpi_w = (PAGE_W - 140) / 4
    for i, (lbl, val, col) in enumerate(kpis):
        kx = 70 + i * (kpi_w + 4)
        rrect(c, kx, db_y - 46, kpi_w, 42, 6, SURFACE2, BORDER, 0.5)
        c.saveState()
        c.setFillColor(col)
        c.setFont("Helvetica-Bold", 6)
        c.drawString(kx + 8, db_y - 16, "●")
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 5.5)
        c.drawString(kx + 16, db_y - 16, lbl)
        c.setFillColor(col)
        c.setFont("Helvetica-Bold", 12 if len(val) < 8 else 9)
        c.drawString(kx + 8, db_y - 36, val)
        c.restoreState()

    # Mini tables
    tbl_y = db_y - 60
    tbl_w = (PAGE_W - 150) / 2

    for ti, (title, headers, rows_data) in enumerate([
        ("LATEST RESERVATIONS", ["CLIENT", "TIME", "TABLE", "STATUS"],
         [("Alisher K.", "19:00", "T3", "confirmed", GREEN),
          ("Dilnoza M.", "20:30", "T7", "pending", AMBER),
          ("Bobur T.", "21:00", "T2", "confirmed", GREEN)]),
        ("LATEST ORDERS", ["CUSTOMER", "TYPE", "TOTAL", "STATUS"],
         [("Sardor A.", "PICKUP", "180,000", "preparing", AMBER),
          ("Nilufar B.", "DELIVERY", "240,000", "pending", AMBER),
          ("Jahon K.", "PICKUP", "95,000", "ready", GREEN)]),
    ]):
        tx = 70 + ti * (tbl_w + 10)
        rrect(c, tx, tbl_y - 128, tbl_w, 128, 6, SURFACE2, BORDER, 0.5)
        c.saveState()
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(tx + 8, tbl_y - 14, title)
        c.setFillColor(RED)
        c.setFont("Helvetica", 5.5)
        c.drawRightString(tx + tbl_w - 8, tbl_y - 14, "View All →")
        c.restoreState()

        c.setStrokeColor(BORDER)
        c.setLineWidth(0.3)
        c.line(tx + 8, tbl_y - 20, tx + tbl_w - 8, tbl_y - 20)

        cw_each = (tbl_w - 16) / len(headers)
        for hi, h in enumerate(headers):
            c.saveState()
            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica-Bold", 5)
            c.drawString(tx + 8 + hi * cw_each, tbl_y - 30, h)
            c.restoreState()

        for ri, row in enumerate(rows_data):
            ry = tbl_y - 44 - ri * 24
            if ri % 2 == 0:
                rrect(c, tx + 4, ry - 10, tbl_w - 8, 20, 2, HexColor("#181818"))
            for ci, cell in enumerate(row[:-2]):
                c.saveState()
                c.setFillColor(white if ci == 0 else TEXT_DIM)
                c.setFont("Helvetica-Bold" if ci == 0 else "Helvetica", 6)
                cx2 = tx + 8 + ci * cw_each
                txt = str(cell)
                max_cw = cw_each - 4
                while c.stringWidth(txt, "Helvetica", 6) > max_cw and len(txt) > 3:
                    txt = txt[:-4] + "…"
                c.drawString(cx2, ry, txt)
                c.restoreState()
            # Status pill
            status_txt = row[-2]
            status_col = row[-1]
            pill_x = tx + 8 + (len(headers) - 1) * cw_each
            pill_w2 = cw_each - 4
            rrect(c, pill_x, ry - 4, pill_w2, 11, 5, HexColor("#0A0A0A"), status_col, 0.6)
            c.saveState()
            c.setFillColor(status_col)
            c.setFont("Helvetica-Bold", 5)
            c.drawCentredString(pill_x + pill_w2/2, ry, status_txt)
            c.restoreState()

    # Footer
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.4)
    c.line(60, 38, PAGE_W - 60, 38)
    c.saveState()
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(60, 26, "SushiGO · Full-Stack Restaurant Platform")
    c.drawRightString(PAGE_W - 60, 26, "3 / 4")
    c.restoreState()


# ── Page 4: Why hire me + live links ─────────────────────────────────────────
def draw_page4(c):
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    label(c, 60, PAGE_H - 36, "SUSHIGO PLATFORM  ·  WHY HIRE ME", TEXT_MUTED, 7, "Helvetica-Bold")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(60, PAGE_H - 44, PAGE_W - 60, PAGE_H - 44)

    heading(c, 60, PAGE_H - 72, "Why I'm the Right Fit", 22, white)

    # Reasons
    reasons = [
        {
            "num": "01",
            "title": "I Deliver Complete Products",
            "text": (
                "This isn't a template or a starter kit. SushiGO is a fully custom-built platform with "
                "every layer: database schema, server actions, UI components, admin tools, auth flows, "
                "and multi-language support — all written from scratch."
            ),
            "col": RED,
        },
        {
            "num": "02",
            "title": "SEO & Performance Ready",
            "text": (
                "Built on Next.js 14 App Router with Server Components, meaning pages are pre-rendered "
                "and search-engine friendly out of the box. Images are optimised via Next/Image, "
                "and routes are code-split automatically."
            ),
            "col": BLUE,
        },
        {
            "num": "03",
            "title": "Mobile-First Responsive Design",
            "text": (
                "Every page is built mobile-first with Tailwind CSS. The design is hand-crafted — "
                "no component library dependencies — giving full visual control and a unique brand identity."
            ),
            "col": GREEN,
        },
        {
            "num": "04",
            "title": "Clean, Maintainable Code",
            "text": (
                "TypeScript strict mode throughout. Path aliases, consistent naming conventions, "
                "and a clear separation of concerns (Server Actions for mutations, "
                "shared Supabase client helpers, typed DB interfaces)."
            ),
            "col": AMBER,
        },
        {
            "num": "05",
            "title": "I Can Update OR Rebuild",
            "text": (
                "Whether you want to enhance your existing site or start fresh with a modern stack, "
                "I have proven experience doing both. I can audit your current platform and propose "
                "the most cost-effective path forward."
            ),
            "col": HexColor("#A855F7"),
        },
    ]

    r_y = PAGE_H - 100
    r_h = 70

    for i, r in enumerate(reasons):
        rx = 60
        ry = r_y - i * (r_h + 8)
        rrect(c, rx, ry - r_h, PAGE_W - 120, r_h, 8, SURFACE2, BORDER, 0.5)
        rrect(c, rx, ry - r_h, 3, r_h, 2, r["col"])

        # Number
        c.saveState()
        c.setFillColor(r["col"])
        c.setFont("Helvetica-Bold", 22)
        c.setFillAlpha(0.15)
        c.drawString(rx + 14, ry - r_h + 12, r["num"])
        c.setFillAlpha(1)
        c.setFillColor(r["col"])
        c.setFont("Helvetica-Bold", 22)
        c.drawString(rx + 14, ry - r_h + 12, r["num"])
        c.restoreState()

        # Title
        c.saveState()
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(rx + 58, ry - 20, r["title"])
        c.restoreState()

        # Body text
        c.saveState()
        c.setFillColor(TEXT_DIM)
        c.setFont("Helvetica", 8)
        max_tw = PAGE_W - 200
        words = r["text"].split()
        lines, line = [], ""
        for w in words:
            test = (line + " " + w).strip()
            if c.stringWidth(test, "Helvetica", 8) <= max_tw:
                line = test
            else:
                lines.append(line)
                line = w
        if line:
            lines.append(line)
        for li, ln in enumerate(lines):
            c.drawString(rx + 58, ry - 34 - li * 11, ln)
        c.restoreState()

    # ── Live links section ────────────────────────────────────────────────────
    links_y = r_y - len(reasons) * (r_h + 8) - 18

    rrect(c, 60, links_y - 110, PAGE_W - 120, 110, 10, SURFACE2, BORDER, 0.7)
    rrect(c, 60, links_y - 110, PAGE_W - 120, 3, 2, RED)

    c.saveState()
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(80, links_y - 22, "Live Demos — See My Work")
    c.restoreState()

    c.setStrokeColor(BORDER)
    c.setLineWidth(0.4)
    c.line(80, links_y - 30, PAGE_W - 80, links_y - 30)

    link_items = [
        ("SushiGO Restaurant Platform", "fluffy-parakeet-topaz.vercel.app",
         "Consumer storefront · Menu · Reservations · Orders · Auth", RED),
        ("Portfolio / Other Work", "labview-three.vercel.app",
         "Additional project — further examples of my development style", BLUE),
    ]

    for i, (title, url, desc, col) in enumerate(link_items):
        lx = 80
        ly = links_y - 50 - i * 38
        c.saveState()
        c.setFillColor(col)
        c.setFont("Helvetica-Bold", 6)
        c.drawString(lx, ly, "●")
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(lx + 12, ly, title)
        c.setFillColor(col)
        c.setFont("Helvetica", 7.5)
        c.drawString(lx + 12, ly - 12, url)
        c.setFillColor(TEXT_DIM)
        c.setFont("Helvetica", 7)
        c.drawString(lx + 12, ly - 23, desc)
        c.restoreState()

    # ── CTA ───────────────────────────────────────────────────────────────────
    cta_y = links_y - 128
    rrect(c, 60, cta_y - 60, PAGE_W - 120, 60, 10, RED, RED_DARK, 0.5)

    c.saveState()
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(PAGE_W / 2, cta_y - 22, "Ready to build your website?")
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#FFCCCC"))
    c.drawCentredString(PAGE_W / 2, cta_y - 38, "Message me and I'll get back to you within 24 hours with a tailored plan and timeline.")
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(white)
    c.drawCentredString(PAGE_W / 2, cta_y - 52, "Available for immediate start · Fixed-price or hourly · Milestone delivery")
    c.restoreState()

    # Footer
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.4)
    c.line(60, 38, PAGE_W - 60, 38)
    c.saveState()
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(60, 26, "SushiGO · Full-Stack Restaurant Platform")
    c.drawRightString(PAGE_W - 60, 26, "4 / 4")
    c.restoreState()


# ── Generate PDF ──────────────────────────────────────────────────────────────
OUTPUT = "/home/user/fluffy-parakeet/upwork_proposal.pdf"

c = canvas.Canvas(OUTPUT, pagesize=A4)
c.setTitle("Upwork Proposal — Full-Stack Web Development")
c.setAuthor("Full-Stack Web Developer")
c.setSubject("Restaurant platform proposal for Upwork job posting")

draw_cover(c)
c.showPage()
draw_page2(c)
c.showPage()
draw_page3(c)
c.showPage()
draw_page4(c)
c.showPage()

c.save()
print(f"PDF saved to {OUTPUT}")
