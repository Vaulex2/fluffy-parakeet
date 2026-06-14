# -*- coding: utf-8 -*-
"""
Korti organi, chigʻanoq, eshitish yoʻli va h.k. uchun maxsus chizilgan
diagrammalar — barchasi oʻzbek (lotin) yozuvida belgilangan.

Chiqish: assets/*.png  (yuqori DPI, shaffof emas, oq fon).
matplotlib + numpy talab qilinadi.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import (
    FancyBboxPatch, FancyArrowPatch, Polygon, Circle, Ellipse,
    Wedge, Rectangle, Arc, PathPatch,
)
from matplotlib.path import Path
import matplotlib.font_manager as fm

# ---- Tema ----
INK     = "#0f2b36"
TEAL    = "#1f7a8c"
TEAL_D  = "#13525e"
TEAL_L  = "#cfe5ea"
CREAM   = "#f6efe2"
SAND    = "#ead8b8"
ACCENT  = "#e07a5f"   # warm
AMBER   = "#e9b44c"
ROSE    = "#d36b8b"
GREEN   = "#5b8c5a"
WHITE   = "#ffffff"
TEXT    = "#10242c"
GREY    = "#8a9aa0"

plt.rcParams["font.family"] = "DejaVu Sans"
plt.rcParams["font.size"] = 13
plt.rcParams["axes.unicode_minus"] = False

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
os.makedirs(ASSETS, exist_ok=True)


def _new(w=12, h=7):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100 * h / w)
    ax.axis("off")
    ax.set_facecolor(WHITE)
    fig.patch.set_facecolor(WHITE)
    return fig, ax


def _save(fig, name):
    path = os.path.join(ASSETS, name + ".png")
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor=WHITE, pad_inches=0.15)
    plt.close(fig)
    print("saved", path)


def box(ax, x, y, w, h, text, fc=TEAL, ec="none", tc=WHITE, fs=13,
        rounding=0.15, weight="bold", lw=0):
    p = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.02,rounding_size={rounding}",
                       fc=fc, ec=ec, lw=lw, zorder=3)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            color=tc, fontsize=fs, fontweight=weight, zorder=4, wrap=True)
    return p


def arrow(ax, x1, y1, x2, y2, color=INK, lw=2.4, style="-|>", mut=18, ls="-"):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=mut,
                        lw=lw, color=color, zorder=2, linestyle=ls,
                        shrinkA=2, shrinkB=2)
    ax.add_patch(a)
    return a


def label(ax, x, y, text, fs=12.5, color=TEXT, ha="center", va="center", weight="normal"):
    ax.text(x, y, text, fontsize=fs, color=color, ha=ha, va=va, fontweight=weight, zorder=5)


def leader(ax, x1, y1, x2, y2, color=GREY, lw=1.3):
    ax.plot([x1, x2], [y1, y2], color=color, lw=lw, zorder=2)
    ax.add_patch(Circle((x1, y1), 0.5, fc=color, ec="none", zorder=3))


# ===================================================================
# 1) Quloqning umumiy tuzilishi — tashqi / oʻrta / ichki
# ===================================================================
def diagram_ear_overview():
    fig, ax = _new(12, 7)
    H = 100 * 7 / 12
    # uchta zona fon
    zones = [(2, "Tashqi quloq", TEAL_L), (35, "Oʻrta quloq", "#f3e2c7"),
             (66, "Ichki quloq", "#e7d9ea")]
    zw = [33, 31, 32]
    for (x, name, col), w in zip(zones, zw):
        ax.add_patch(FancyBboxPatch((x, 6), w, H - 14,
                     boxstyle="round,pad=0.2,rounding_size=1.2",
                     fc=col, ec="none", zorder=0))
        ax.text(x + w / 2, H - 5, name, ha="center", va="center",
                fontsize=15, fontweight="bold", color=INK)

    # --- Tashqi quloq: aurikula + kanal ---
    auric = Polygon([(7, 18), (5, 30), (8, 42), (15, 44), (14, 30), (12, 20)],
                    closed=True, fc=ACCENT, ec=INK, lw=1.5, zorder=2)
    ax.add_patch(auric)
    ax.add_patch(Ellipse((10, 31), 5, 12, fc="#f0a98f", ec=INK, lw=1, zorder=3))
    # eshitish yo'li
    ax.add_patch(FancyBboxPatch((14, 27), 18, 8, boxstyle="round,pad=0.02,rounding_size=1",
                 fc=WHITE, ec=INK, lw=1.5, zorder=2))
    label(ax, 23, 31, "Eshitish yoʻli", fs=11)
    leader(ax, 9, 40, 9, 50); label(ax, 9, 52, "Quloq suprasi", fs=11)

    # --- nog'ora parda ---
    ax.plot([32, 32], [25, 37], color=ROSE, lw=4, zorder=4)
    leader(ax, 32, 24, 30, 14); label(ax, 30, 11, "Nogʻora\nparda", fs=10.5)

    # --- O'rta quloq: suyakchalar ---
    ax.add_patch(Circle((40, 33), 3.2, fc=AMBER, ec=INK, lw=1.3, zorder=4))   # malleus
    ax.add_patch(Circle((47, 36), 3.0, fc=AMBER, ec=INK, lw=1.3, zorder=4))   # incus
    ax.add_patch(Polygon([(52, 35), (57, 33), (57, 29), (52, 31)], closed=True,
                 fc=AMBER, ec=INK, lw=1.3, zorder=4))                          # stapes
    arrow(ax, 35, 31, 39, 33, color=INK, lw=1.6)
    leader(ax, 47, 30, 47, 12); label(ax, 47, 8.5, "Suyakchalar\n(malleus·incus·stapes)", fs=10.5)

    # --- Ichki quloq: chig'anoq spiral ---
    cx, cy = 80, 30
    th = np.linspace(0, 4 * np.pi, 300)
    r = 1.2 + th * 1.1
    ax.plot(cx + r * np.cos(th), cy + r * np.sin(th), color=TEAL_D, lw=4, zorder=3)
    ax.add_patch(Circle((cx, cy), 14, fill=False, ec="none"))
    leader(ax, cx, cy + 13, cx, 52); label(ax, cx, 55, "Chigʻanoq (cochlea)", fs=11)
    # nerv
    arrow(ax, cx + 4, cy - 11, 93, 11, color=GREEN, lw=2, style="-|>")
    label(ax, 90, 7, "Eshitish nervi", fs=10.5, color=GREEN)

    # oval oyna
    ax.plot([58, 60], [31, 33], color=INK, lw=2)
    label(ax, 62, 24, "Oval oyna", fs=9.5, color=INK)

    _save(fig, "ear_overview")


# ===================================================================
# 2) Eshitish suyakchalari zanjiri
# ===================================================================
def diagram_ossicles():
    fig, ax = _new(12, 6.6)
    H = 100 * 6.6 / 12
    ax.text(50, H - 3, "Eshitish suyakchalari zanjiri", ha="center",
            fontsize=15, fontweight="bold", color=INK)
    # nog'ora parda
    ax.add_patch(Polygon([(12, 12), (16, 12), (16, 44), (12, 44)], closed=True,
                 fc=ROSE, ec=INK, lw=1.5, alpha=.85, zorder=2))
    label(ax, 14, 7, "Nogʻora parda", fs=11, color=INK)
    # malleus
    ax.add_patch(FancyBboxPatch((22, 18), 14, 9, boxstyle="round,pad=0.02,rounding_size=1.5",
                 fc=AMBER, ec=INK, lw=1.4, zorder=3))
    label(ax, 29, 22.5, "Bolgʻacha\n(malleus)", fs=11, color=INK, weight="bold")
    # incus
    ax.add_patch(FancyBboxPatch((42, 26), 14, 9, boxstyle="round,pad=0.02,rounding_size=1.5",
                 fc=AMBER, ec=INK, lw=1.4, zorder=3))
    label(ax, 49, 30.5, "Sandon\n(incus)", fs=11, color=INK, weight="bold")
    # stapes
    ax.add_patch(FancyBboxPatch((62, 18), 14, 9, boxstyle="round,pad=0.02,rounding_size=1.5",
                 fc=AMBER, ec=INK, lw=1.4, zorder=3))
    label(ax, 69, 22.5, "Uzangi\n(stapes)", fs=11, color=INK, weight="bold")
    # oval window
    ax.add_patch(Polygon([(82, 12), (86, 12), (86, 44), (82, 44)], closed=True,
                 fc=TEAL, ec=INK, lw=1.5, alpha=.85, zorder=2))
    label(ax, 84, 7, "Oval oyna", fs=11, color=INK)

    for x1, x2 in [(16, 22), (36, 42), (56, 62), (76, 82)]:
        arrow(ax, x1, 30, x2, 30, color=INK, lw=2.4)
    ax.text(50, H - 9, "havo tebranishi  →  mexanik tebranish  →  suyuqlik toʻlqini",
            ha="center", fontsize=12, color=TEAL_D, style="italic")
    _save(fig, "ossicles")


# ===================================================================
# 3) Impedans moslashuvi — maydon nisbati
# ===================================================================
def diagram_impedance():
    fig, ax = _new(12, 6.6)
    H = 100 * 6.6 / 12
    ax.text(50, H - 3, "Impedans moslashuvi: bosimning jamlanishi",
            ha="center", fontsize=15, fontweight="bold", color=INK)
    # katta nog'ora parda
    ax.add_patch(Ellipse((22, 28), 10, 34, fc=ROSE, ec=INK, lw=1.6, alpha=.85))
    label(ax, 22, 47, "Nogʻora parda", fs=12, color=INK, weight="bold")
    label(ax, 22, 8, "yuza ≈ 55 mm²", fs=11, color=INK)
    # kichik uzangi asosi
    ax.add_patch(Ellipse((74, 28), 3.5, 10, fc=TEAL, ec=INK, lw=1.6, alpha=.9))
    label(ax, 74, 41, "Uzangi asosi", fs=12, color=INK, weight="bold")
    label(ax, 74, 13, "yuza ≈ 3.2 mm²", fs=11, color=INK)
    # konvergent yo'naltiruvchilar
    for y in (40, 33, 28, 23, 16):
        arrow(ax, 28, y, 71, 28, color=GREY, lw=1.4, mut=12)
    # natija (pastda)
    ax.add_patch(FancyBboxPatch((30, 2), 40, 9, boxstyle="round,pad=0.3,rounding_size=2",
                 fc=CREAM, ec=AMBER, lw=2))
    ax.text(50, 6.5, "≈ 17× (maydon) × 1.3× (richag)  ≈ 22×  ⇒  +25–30 dB",
            ha="center", va="center", fontsize=12, color=INK, fontweight="bold")
    _save(fig, "impedance")


# ===================================================================
# 4) Chig'anoq ko'ndalang kesimi — 3 scala
# ===================================================================
def diagram_cochlea_cross():
    fig, ax = _new(12, 7.2)
    H = 100 * 7.2 / 12
    ax.text(50, H - 3, "Chigʻanoq koʻndalang kesimi", ha="center",
            fontsize=15, fontweight="bold", color=INK)
    cx, cy = 42, 30
    # tashqi devor
    ax.add_patch(Circle((cx, cy), 24, fc="#f4eee2", ec=INK, lw=1.6, zorder=1))
    # scala vestibuli (yuqori)
    ax.add_patch(Wedge((cx, cy), 24, 18, 162, width=24, fc=TEAL_L, ec="none", zorder=2))
    # scala tympani (pastki)
    ax.add_patch(Wedge((cx, cy), 24, 198, 342, width=24, fc="#dfe7e0", ec="none", zorder=2))
    # scala media (o'rta uchburchak)
    media = Polygon([(cx - 16, cy + 2), (cx + 16, cy + 2), (cx + 14, cy - 6), (cx - 14, cy - 6)],
                    closed=True, fc="#f0dcb0", ec=INK, lw=1.2, zorder=3)
    ax.add_patch(media)
    # Reissner (yuqori chiziq)
    ax.plot([cx - 16, cx + 16], [cy + 2, cy + 2], color=ROSE, lw=2.2, zorder=4)
    # bazilyar membrana (pastki chiziq)
    ax.plot([cx - 14, cx + 14], [cy - 6, cy - 6], color=ACCENT, lw=3, zorder=4)
    # Korti organi (bazilyar membrana ustida, yuqoriga qaragan)
    for xx in np.linspace(cx - 9, cx + 9, 5):
        ax.add_patch(Polygon([(xx - 1.2, cy - 6), (xx + 1.2, cy - 6), (xx, cy - 3.6)],
                     closed=True, fc=TEAL_D, ec="none", zorder=5))

    # yorliqlar
    label(ax, cx, cy + 13, "Scala vestibuli\n(perilimfa)", fs=11, color=INK)
    label(ax, cx, cy - 15, "Scala tympani\n(perilimfa)", fs=11, color=INK)
    label(ax, cx, cy - 0.4, "Scala media (endolimfa)", fs=10, color=INK, weight="bold")
    leader(ax, cx + 16, cy + 2, 82, cy + 16); label(ax, 86, cy + 16, "Reissner\nmembranasi", fs=10.5, ha="center", color=ROSE)
    leader(ax, cx + 14, cy - 6, 82, cy - 8); label(ax, 86, cy - 8, "Bazilyar\nmembrana", fs=10.5, ha="center", color=ACCENT)
    leader(ax, cx, cy - 3, 16, cy - 18); label(ax, 14, cy - 21, "Korti organi", fs=10.5, color=TEAL_D)
    _save(fig, "cochlea_cross")


# ===================================================================
# 5) Korti organi
# ===================================================================
def diagram_organ_corti():
    fig, ax = _new(12, 7)
    H = 100 * 7 / 12
    ax.text(50, H - 3, "Korti organi", ha="center", fontsize=15,
            fontweight="bold", color=INK)
    # bazilyar membrana
    ax.add_patch(Rectangle((8, 12), 84, 4, fc=ACCENT, ec="none", zorder=2))
    label(ax, 50, 9, "Bazilyar membrana", fs=11, color=ACCENT, weight="bold")
    # tektorial membrana
    ax.add_patch(Polygon([(8, 46), (92, 40), (92, 44), (8, 50)], closed=True,
                 fc=ROSE, alpha=.55, ec="none", zorder=2))
    label(ax, 80, 52, "Tektorial membrana", fs=11, color=ROSE, weight="bold")

    def hair_cell(x, w, col, tname):
        ax.add_patch(FancyBboxPatch((x, 16), w, 18, boxstyle="round,pad=0.02,rounding_size=1",
                     fc=col, ec=INK, lw=1.2, zorder=3))
        # stereosiliyalar
        for i in range(5):
            xx = x + 1.5 + i * (w - 3) / 4
            ax.plot([xx, xx], [34, 41], color=INK, lw=1.8, zorder=4)
        ax.text(x + w / 2, 25, tname, ha="center", va="center", fontsize=10,
                color=WHITE, fontweight="bold", zorder=5)

    # 1 ta IHC
    hair_cell(20, 9, TEAL_D, "IHC")
    # 3 ta OHC
    for i, x in enumerate([55, 67, 79]):
        hair_cell(x, 8, TEAL, "OHC")
    label(ax, 24.5, 60, "Ichki tukli\nhujayra (IHC)\n~3500 ta", fs=10.5, color=TEAL_D)
    label(ax, 67, 64, "Tashqi tukli hujayralar (OHC) — ~12000 ta", fs=10.5, color=TEAL)
    # nerv tolalari
    arrow(ax, 24.5, 16, 24.5, 6, color=GREEN, lw=2)
    label(ax, 24.5, 3, "Eshitish nervi tolalari (afferent ~95%)", fs=10, color=GREEN)
    _save(fig, "organ_corti")


# ===================================================================
# 6) Mexanotransduksiya
# ===================================================================
def diagram_mechanotransduction():
    fig, ax = _new(12, 7)
    H = 100 * 7 / 12
    ax.set_ylim(-3, H)
    ax.text(50, H - 2, "Mexanotransduksiya — mexanik signal → elektr",
            ha="center", fontsize=15, fontweight="bold", color=INK)
    # hujayra tanasi
    cellx, celly, cellw, cellh = 24, 9, 40, 18
    ax.add_patch(FancyBboxPatch((cellx, celly), cellw, cellh,
                 boxstyle="round,pad=0.3,rounding_size=2",
                 fc=TEAL_L, ec=INK, lw=1.5, zorder=2))
    label(ax, cellx + cellw / 2, celly + 4, "Tukli hujayra\n(depolarizatsiya)",
          fs=12, color=INK, weight="bold")
    # stereosiliyalar — zinapoyasimon, oʻngga egilgan
    base_y = celly + cellh
    xs = [28, 34, 40, 46, 52, 58]
    hs = [6, 8, 10, 12, 14, 16]
    bend = 0.22
    tips = []
    for x, h in zip(xs, hs):
        x2 = x + h * bend
        ax.plot([x, x2], [base_y, base_y + h], color=INK, lw=4,
                zorder=4, solid_capstyle="round")
        tips.append((x2, base_y + h))
    # tip-link bogʻlari: kalta siliyaning uchidan keyingisining yon tomoniga
    for i in range(len(tips) - 1):
        nx = xs[i + 1] + (hs[i + 1] * 0.6) * bend
        ny = base_y + hs[i + 1] * 0.6
        ax.plot([tips[i][0], nx], [tips[i][1], ny], color=ACCENT, lw=2, zorder=5)
    label(ax, 78, 44, "Uchlararo bogʻ (tip-link)", fs=11, color=ACCENT)
    leader(ax, 66, 44, tips[4][0] + 1, tips[4][1] - 2, color=ACCENT)
    # K+ kirishi (oʻngdan, siliyalar ustiga)
    arrow(ax, 70, 30, 60, 38, color=TEAL_D, lw=2.6)
    label(ax, 78, 28, "K⁺ kirishi\n(endolimfadan)", fs=11.5, color=TEAL_D, weight="bold")
    # MET kanal
    leader(ax, xs[2], base_y, 18, base_y + 6, color=INK)
    label(ax, 14, base_y + 7.5, "MET kanali\nochiladi", fs=10.5, color=INK)
    # endokoxlear potensial
    ax.add_patch(FancyBboxPatch((74, 6), 24, 13, boxstyle="round,pad=0.3,rounding_size=2",
                 fc=CREAM, ec=AMBER, lw=2))
    ax.text(86, 12.5, "Endokoxlear\npotensial\n≈ +80 mV", ha="center", va="center",
            fontsize=12, color=INK, fontweight="bold")
    # natija
    arrow(ax, cellx + cellw / 2, celly, cellx + cellw / 2, 1.5, color=GREEN, lw=2.6)
    label(ax, cellx + cellw / 2, -1.5,
          "Ca²⁺ kanallari ochiladi → glutamat → nerv impulsi",
          fs=11, color=GREEN, weight="bold")
    _save(fig, "mechanotransduction")


# ===================================================================
# 7) Tonotopiya — yoyilgan chig'anoq
# ===================================================================
def diagram_tonotopy():
    fig, ax = _new(12, 6.4)
    H = 100 * 6.4 / 12
    ax.text(50, H - 3, "Bazilyar membrana boʻylab tonotopiya", ha="center",
            fontsize=15, fontweight="bold", color=INK)
    # yoyilgan chig'anoq (ponasimon)
    poly = Polygon([(8, 22), (90, 18), (90, 30), (8, 38)], closed=True,
                   fc="#f0dcb0", ec=INK, lw=1.5, zorder=2)
    ax.add_patch(poly)
    # rangli gradient chiziqlar
    cols = ["#c0392b", "#e07a5f", "#e9b44c", "#5b8c5a", "#1f7a8c", "#34539b"]
    freqs = ["20 kHz", "10 kHz", "4 kHz", "1 kHz", "250 Hz", "20 Hz"]
    xs = np.linspace(12, 86, 6)
    for x, c, f in zip(xs, cols, freqs):
        yt = np.interp(x, [8, 90], [22, 18]) + np.interp(x, [8, 90], [16, 12])
        yb = np.interp(x, [8, 90], [22, 18])
        ax.plot([x, x], [yb, yt], color=c, lw=5, zorder=3)
        ax.text(x, yt + 3.5, f, ha="center", fontsize=11, color=c, fontweight="bold")
    label(ax, 12, 13, "ASOS\n(tor, qattiq)", fs=11, color="#c0392b", weight="bold")
    label(ax, 86, 9, "CHOʻQQI\n(keng, yumshoq)", fs=11, color="#34539b", weight="bold")
    label(ax, 12, 44, "Yuqori chastota", fs=11.5, color=INK)
    label(ax, 86, 44, "Past chastota", fs=11.5, color=INK)
    arrow(ax, 24, 44, 74, 44, color=GREY, lw=1.6)
    _save(fig, "tonotopy")


# ===================================================================
# 8) Markaziy eshitish yoʻli — flowchart
# ===================================================================
def diagram_pathway():
    fig, ax = _new(12, 7.6)
    H = 100 * 7.6 / 12
    ax.text(50, H - 2.5, "Markaziy eshitish yoʻli", ha="center",
            fontsize=15, fontweight="bold", color=INK)
    steps = [
        ("Tukli hujayralar (Korti organi)", TEAL_D),
        ("Spiral ganglion → eshitish nervi (VIII)", TEAL),
        ("Cochlear yadrolar (uzunchoq miya)", TEAL),
        ("Yuqori olivar kompleks (lokalizatsiya: ITD/ILD)", AMBER),
        ("Lateral lemniscus → Colliculus inferior", ACCENT),
        ("Medial tizzasimon tana (talamus)", ROSE),
        ("Eshitish poʻstlogʻi (Heschl pushtasi, A1)", "#34539b"),
    ]
    n = len(steps)
    bw, bh = 52, 6.0
    cx = 42
    top, bottom = H - 11.5, 2.0
    ys = np.linspace(top, bottom, n)
    for i, (txt, col) in enumerate(steps):
        tc = INK if col == AMBER else WHITE
        box(ax, cx - bw / 2, ys[i], bw, bh, txt, fc=col, tc=tc, fs=12, rounding=1.0)
        if i < n - 1:
            arrow(ax, cx, ys[i], cx, ys[i + 1] + bh, color=INK, lw=2.2)
    ax.text(83, (top + bottom) / 2 + bh / 2, "Tonotopiya\nbarcha\nbosqichda\nsaqlanadi",
            ha="center", va="center", fontsize=11, color=TEAL_D, style="italic")
    ax.set_ylim(0, H)
    _save(fig, "pathway")


# ===================================================================
# 9) Eshitish diapazoni — audiogramma uslubida
# ===================================================================
def diagram_hearing_range():
    fig, ax = plt.subplots(figsize=(12, 6.4), dpi=200)
    fig.patch.set_facecolor(WHITE)
    ax.set_facecolor("#fbf8f1")
    freqs = np.array([20, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 20000])
    # eshitish chegarasi (taxminiy, dB SPL)
    thr = np.array([60, 30, 18, 10, 5, 2, 0, 8, 25, 45])
    ax.plot(freqs, thr, color=TEAL_D, lw=3, marker="o", zorder=4,
            label="Eshitish chegarasi")
    ax.fill_between([500, 4000], -10, 65, color=AMBER, alpha=.18, zorder=1)
    ax.text(1400, 58, "Nutq sohasi\n(~0.5–4 kHz)", ha="center", fontsize=12,
            color="#9a6b00", fontweight="bold")
    ax.axvspan(20, 20000, color=TEAL_L, alpha=.10)
    ax.set_xscale("log")
    ax.set_xlim(18, 22000)
    ax.set_ylim(70, -10)  # past dB = sezgir (yuqorida)
    ax.set_xlabel("Chastota (Hz) — log shkala", fontsize=12.5, color=INK)
    ax.set_ylabel("Eshitish chegarasi (dB SPL)", fontsize=12.5, color=INK)
    ax.set_title("Insonning eshitish diapazoni: ~20 Hz – 20 kHz",
                 fontsize=15, fontweight="bold", color=INK, pad=12)
    ax.set_xticks([20, 100, 1000, 10000, 20000])
    ax.set_xticklabels(["20", "100", "1k", "10k", "20k"])
    ax.grid(True, which="both", ls=":", color="#c9d4d7", alpha=.7)
    ax.legend(loc="lower center", fontsize=11)
    for s in ax.spines.values():
        s.set_color("#9fb0b5")
    fig.savefig(os.path.join(ASSETS, "hearing_range.png"), dpi=200,
                bbox_inches="tight", facecolor=WHITE, pad_inches=0.15)
    plt.close(fig)
    print("saved hearing_range.png")


# ===================================================================
# 0) Sarlavha uchun bezakli rasm — quloq + tovush toʻlqinlari
# ===================================================================
def diagram_hero():
    fig, ax = plt.subplots(figsize=(12, 6.75), dpi=200)
    H = 100 * 6.75 / 12
    ax.set_xlim(0, 100); ax.set_ylim(0, H); ax.axis("off")
    fig.patch.set_facecolor(INK)
    ax.set_facecolor(INK)
    ax.add_patch(Rectangle((0, 0), 100, H, fc=INK, zorder=0))
    # tovush to'lqinlari (konsentrik yoylar)
    cx, cy = 70, H / 2
    for i, r in enumerate(np.linspace(10, 46, 7)):
        col = [TEAL, TEAL_L, AMBER, ACCENT][i % 4]
        ax.add_patch(Arc((cx, cy), r, r, angle=0, theta1=120, theta2=240,
                     color=col, lw=3, alpha=0.85 - i * 0.07, zorder=2))
    # stilize quloq
    auric = Polygon([(70, cy - 16), (62, cy - 8), (60, cy + 6), (66, cy + 16),
                     (78, cy + 14), (80, cy - 2), (76, cy - 14)],
                    closed=True, fc=ACCENT, ec=CREAM, lw=2, zorder=4)
    ax.add_patch(auric)
    ax.add_patch(Ellipse((70, cy), 8, 16, fc="#f0a98f", ec=CREAM, lw=1.5, zorder=5))
    th = np.linspace(0, 3.2 * np.pi, 200)
    r = 0.7 + th * 1.0
    ax.plot(70 + r * np.cos(th) - 2, cy + r * np.sin(th), color=INK, lw=2.5, zorder=6)
    fig.savefig(os.path.join(ASSETS, "hero.png"), dpi=200, bbox_inches="tight",
                facecolor=INK, pad_inches=0)
    plt.close(fig)
    print("saved hero.png")


def main():
    diagram_hero()
    diagram_ear_overview()
    diagram_ossicles()
    diagram_impedance()
    diagram_cochlea_cross()
    diagram_organ_corti()
    diagram_mechanotransduction()
    diagram_tonotopy()
    diagram_pathway()
    diagram_hearing_range()
    print("Barcha diagrammalar tayyor.")


if __name__ == "__main__":
    main()
