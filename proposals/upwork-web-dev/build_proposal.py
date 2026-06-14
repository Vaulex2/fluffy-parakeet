# -*- coding: utf-8 -*-
"""
Upwork web-development proposal -> PDF (WeasyPrint).
Renders the SAME content in two design themes so the client can choose.

Output:
  out/Proposal-Midnight.pdf   (bold dark, red accent - matches the restaurant brand)
  out/Proposal-Aurora.pdf     (clean light, navy + teal - corporate/professional)
"""
import os
from weasyprint import HTML

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

# ----------------------------------------------------------------------
# EDIT THESE: your personal details (placeholders shown on the PDF)
# ----------------------------------------------------------------------
ME = {
    "name": "Your Name",
    "role": "Full-Stack Web Developer",
    "email": "you@email.com",
    "upwork": "Top Rated · Web Development",
    "tagline": "I design and build fast, responsive, SEO-ready websites and web apps.",
}

# ----------------------------------------------------------------------
# THEMES
# ----------------------------------------------------------------------
THEMES = {
    "Midnight": {
        "bg": "#0B0B0B", "panel": "#141414", "panel2": "#1c1c1c",
        "ink": "#F4ECD8", "muted": "#A9A294", "line": "rgba(244,236,216,0.12)",
        "accent": "#E11D2A", "accent2": "#E9B44C", "good": "#5BD16A",
        "cover_bg": "linear-gradient(135deg,#0B0B0B 0%, #1a0608 60%, #2a0a0d 100%)",
        "cover_ink": "#F4ECD8", "chip_bg": "rgba(225,29,42,0.14)", "chip_ink": "#ff8a93",
        "head_font": "'Liberation Sans','DejaVu Sans',sans-serif",
        "body_font": "'DejaVu Sans',sans-serif",
    },
    "Aurora": {
        "bg": "#ffffff", "panel": "#f5f8fa", "panel2": "#eef3f6",
        "ink": "#10242c", "muted": "#5a6a70", "line": "#dce5e9",
        "accent": "#1f7a8c", "accent2": "#e07a5f", "good": "#2e9e5b",
        "cover_bg": "linear-gradient(135deg,#0f2b3a 0%, #134e5e 55%, #1f7a8c 100%)",
        "cover_ink": "#ffffff", "chip_bg": "rgba(31,122,140,0.12)", "chip_ink": "#136074",
        "head_font": "'Liberation Sans','DejaVu Sans',sans-serif",
        "body_font": "'DejaVu Sans',sans-serif",
    },
}

# ----------------------------------------------------------------------
# Sushi GO homepage recreation (faithful to the real source/brand)
# ----------------------------------------------------------------------
def sushi_preview():
    return """
    <div class="browser">
      <div class="bbar">
        <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
        <span class="url">fluffy-parakeet-topaz.vercel.app</span>
      </div>
      <div class="screen sushi">
        <div class="snav">
          <span class="logo"><b>S</b>&nbsp;SUSHI&nbsp;GO</span>
          <span class="links">Menu &nbsp; About &nbsp; Reservations &nbsp; <b class="cart">&#128722; 2</b></span>
        </div>
        <div class="hero">
          <div class="heroL">
            <div class="kicker">Taste the tradition</div>
            <div class="h1">FRESH SUSHI<br>EVERY&nbsp;DAY</div>
            <div class="cta"><span class="btn">ORDER NOW</span><span class="btn ghost">View Menu</span></div>
            <div class="stats">
              <div><b>50+</b><span>Unique Rolls</span></div>
              <div><b>100%</b><span>Fresh</span></div>
              <div><b>4.9</b><span>Rating</span></div>
            </div>
          </div>
          <div class="heroR"><div class="ring"></div><div class="plate"></div></div>
        </div>
        <div class="marq">FRESH DAILY &nbsp;&#9733;&nbsp; PREMIUM INGREDIENTS &nbsp;&#9733;&nbsp; DINE IN &nbsp;&#9733;&nbsp; TAKEAWAY &nbsp;&#9733;&nbsp; DELIVERY</div>
      </div>
    </div>
    """

def labview_preview():
    return """
    <div class="browser">
      <div class="bbar">
        <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
        <span class="url">labview-three.vercel.app</span>
      </div>
      <div class="screen placeholder">
        <div class="ph-badge">PROJECT&nbsp;2</div>
        <div class="ph-title">labview-three</div>
        <div class="ph-note">Live preview &amp; screenshots to be added<br><span>(send me a screenshot or a one-line description and I'll drop it in here)</span></div>
      </div>
    </div>
    """

# ----------------------------------------------------------------------
# Page builders
# ----------------------------------------------------------------------
def cover():
    return f"""
    <section class="page cover">
      <div class="cov-top">
        <span class="badge">{ME['upwork']}</span>
      </div>
      <div class="cov-mid">
        <div class="cov-eyebrow">WEB DEVELOPMENT</div>
        <h1 class="cov-h1">Proposal</h1>
        <p class="cov-sub">{ME['tagline']}</p>
      </div>
      <div class="cov-foot">
        <div class="cov-me">
          <div class="cov-name">{ME['name']}</div>
          <div class="cov-role">{ME['role']}</div>
        </div>
        <div class="cov-contact">
          <div>{ME['email']}</div>
          <div class="cov-date">Prepared for your project &middot; 2026</div>
        </div>
      </div>
      <div class="cov-orb"></div>
    </section>
    """

def understanding():
    asks = [
        ("Update or build new", "Either enhance your current platform's functionality &amp; aesthetics, or craft a fresh site aligned to your brand — your call, I'm set up for both."),
        ("Visually appealing layout", "Clean visual hierarchy, considered typography and spacing, and a design that reflects your brand identity."),
        ("Mobile responsive", "Fluid, mobile-first layouts that look right on phones, tablets and desktop — tested across breakpoints."),
        ("SEO optimized", "Semantic markup, fast load times, metadata, Open Graph, sitemaps and Core-Web-Vitals tuning."),
        ("Strong UX", "Intuitive navigation and conversion-focused flows, informed by how real users move through a site."),
    ]
    rows = "".join(
        f"""<div class="ask"><div class="ask-ic">{i+1}</div>
            <div><div class="ask-t">{t}</div><div class="ask-d">{d}</div></div></div>"""
        for i, (t, d) in enumerate(asks)
    )
    return f"""
    <section class="page">
      {head("01", "Understanding what you need")}
      <p class="lead">You're looking for a developer to <b>either refresh your existing website or build a new one</b> —
      with a polished, responsive design, real attention to user experience, and search-engine optimization baked in.
      Here's how I map to each requirement, and proof I've delivered exactly this kind of work.</p>
      <div class="asks">{rows}</div>
    </section>
    """

def proof():
    return f"""
    <section class="page">
      {head("02", "Proof of work")}
      <p class="lead">Two production builds that demonstrate end-to-end delivery — design, responsive front-end,
      database, auth, and an admin back-office.</p>

      <div class="proj">
        {sushi_preview()}
        <div class="proj-body">
          <div class="proj-tag">Featured project</div>
          <h3 class="proj-title">Sushi GO — full-stack restaurant platform</h3>
          <p class="proj-desc">A complete ordering, reservation and management platform for a sushi cafe
          (Namangan, Uzbekistan). Customer-facing site <i>and</i> a real admin dashboard.</p>
          <div class="bul">
            <span>&#9656; Online menu + cart with fly-to-cart animation &amp; checkout (pickup/delivery)</span>
            <span>&#9656; Real-time table reservations with availability &amp; double-booking prevention</span>
            <span>&#9656; Accounts, Google sign-in, loyalty tiers, order &amp; booking history</span>
            <span>&#9656; Admin dashboard: orders, reservations, menu, tables &amp; users (live updates)</span>
            <span>&#9656; Email confirmations, rate-limiting, role-based access &amp; dark-mode UI</span>
          </div>
          <div class="stack">
            {''.join(f'<span class="pill">{t}</span>' for t in
              ['Next.js 14','React 18','TypeScript','Tailwind','Supabase','Server Actions','PostgreSQL','Resend','Vercel'])}
          </div>
        </div>
      </div>

      <div class="proj">
        {labview_preview()}
        <div class="proj-body">
          <div class="proj-tag alt">Project two</div>
          <h3 class="proj-title">labview-three</h3>
          <p class="proj-desc">A second live build deployed on Vercel. Add a short description and a screenshot
          and this section will showcase it alongside the work above.</p>
          <div class="bul">
            <span>&#9656; Live &amp; deployed &mdash; <b>labview-three.vercel.app</b></span>
            <span>&#9656; Responsive front-end with a modern, branded layout</span>
            <span>&#9656; [ Add 2&ndash;3 highlight features here ]</span>
          </div>
          <div class="stack">
            {''.join(f'<span class="pill">{t}</span>' for t in ['React / Next.js','Responsive','Vercel'])}
          </div>
        </div>
      </div>
    </section>
    """

def approach():
    steps = [
        ("Discovery", "Goals, brand, content and references. We agree scope: refresh vs. new build."),
        ("Design", "Wireframe &rarr; visual design of key pages, aligned to your brand identity. You review before code."),
        ("Build", "Responsive, accessible front-end with clean, maintainable code. Staged preview links throughout."),
        ("SEO &amp; speed", "Semantic markup, metadata, performance and Core Web Vitals — built in, not bolted on."),
        ("Launch &amp; support", "Deploy, QA across devices, hand-off docs, and a support window after go-live."),
    ]
    cards = "".join(
        f"""<div class="step"><div class="step-n">{i+1}</div>
            <div class="step-t">{t}</div><div class="step-d">{d}</div></div>"""
        for i, (t, d) in enumerate(steps)
    )
    return f"""
    <section class="page">
      {head("03", "How I'll approach your project")}
      <p class="lead">A clear, low-risk process with visible progress at every stage — no black boxes.</p>
      <div class="steps">{cards}</div>
      <div class="why">
        <h3 class="why-h">Why work with me</h3>
        <div class="why-grid">
          <div><b>End-to-end</b><span>Design, front-end, database, auth and deployment — one accountable partner.</span></div>
          <div><b>Responsive by default</b><span>Mobile-first; tested on real breakpoints, not just a desktop preview.</span></div>
          <div><b>SEO &amp; performance</b><span>Fast, crawlable, and tuned for Core Web Vitals from day one.</span></div>
          <div><b>Clear communication</b><span>Frequent preview links, plain-English updates, on-time delivery.</span></div>
        </div>
      </div>
    </section>
    """

def cta():
    return f"""
    <section class="page closing">
      <div class="close-wrap">
        <div class="close-eyebrow">LET'S BUILD IT</div>
        <h2 class="close-h">Ready to start when you are.</h2>
        <p class="close-p">Tell me whether you'd like to <b>refresh the current site</b> or <b>start fresh</b>,
        share any brand assets or references, and I'll come back with a tailored scope, timeline and fixed quote.</p>
        <div class="close-steps">
          <div><b>1</b> Quick call / message to align on scope</div>
          <div><b>2</b> I send timeline + fixed-price quote</div>
          <div><b>3</b> Design preview within the first week</div>
        </div>
        <div class="close-card">
          <div class="cc-name">{ME['name']}</div>
          <div class="cc-role">{ME['role']}</div>
          <div class="cc-row">{ME['email']} &nbsp;&middot;&nbsp; {ME['upwork']}</div>
        </div>
        <div class="thanks">Thank you for your consideration.</div>
      </div>
    </section>
    """

def head(num, title):
    return f'<div class="sec-head"><span class="sec-num">{num}</span><h2 class="sec-title">{title}</h2></div>'

# ----------------------------------------------------------------------
# CSS
# ----------------------------------------------------------------------
def css(t):
    return f"""
    @page {{ size: A4; margin: 0; }}
    * {{ box-sizing: border-box; }}
    html,body {{ margin:0; padding:0; }}
    body {{ font-family:{t['body_font']}; color:{t['ink']}; background:{t['bg']};
            font-size:11px; line-height:1.5; -weasy-hyphens:none; }}
    .page {{ position:relative; width:210mm; min-height:297mm; padding:18mm 16mm 16mm;
             background:{t['bg']}; page-break-after:always; overflow:hidden; }}
    .page:last-child {{ page-break-after:auto; }}
    b {{ color:{t['ink']}; }}

    /* ---- section head ---- */
    .sec-head {{ display:flex; align-items:baseline; gap:10px; border-bottom:2px solid {t['line']};
                 padding-bottom:8px; margin-bottom:14px; }}
    .sec-num {{ font-family:{t['head_font']}; font-weight:800; font-size:13px; color:{t['accent']};
                letter-spacing:1px; }}
    .sec-title {{ font-family:{t['head_font']}; font-weight:800; font-size:23px; margin:0;
                  letter-spacing:-0.5px; color:{t['ink']}; }}
    .lead {{ color:{t['muted']}; font-size:12px; line-height:1.6; max-width:170mm; margin:0 0 16px; }}
    .lead b {{ color:{t['ink']}; }}

    /* ---- cover ---- */
    .cover {{ background:{t['cover_bg']}; color:{t['cover_ink']}; display:flex; flex-direction:column;
              justify-content:space-between; padding:22mm 18mm; }}
    .badge {{ display:inline-block; border:1px solid rgba(255,255,255,0.35); color:{t['cover_ink']};
              padding:5px 12px; border-radius:30px; font-size:10px; letter-spacing:1.5px; }}
    .cov-eyebrow {{ font-family:{t['head_font']}; letter-spacing:6px; font-size:13px; opacity:.85;
                    margin-bottom:6px; }}
    .cov-h1 {{ font-family:{t['head_font']}; font-weight:800; font-size:84px; margin:0; line-height:.9;
               letter-spacing:-2px; }}
    .cov-sub {{ font-size:15px; max-width:135mm; margin:16px 0 0; opacity:.92; line-height:1.6; }}
    .cov-foot {{ display:flex; justify-content:space-between; align-items:flex-end;
                 border-top:1px solid rgba(255,255,255,0.25); padding-top:14px; }}
    .cov-name {{ font-family:{t['head_font']}; font-weight:800; font-size:20px; }}
    .cov-role {{ opacity:.85; font-size:12px; }}
    .cov-contact {{ text-align:right; font-size:12px; opacity:.9; }}
    .cov-date {{ opacity:.7; margin-top:3px; }}
    .cov-orb {{ position:absolute; width:340px; height:340px; right:-90px; top:120px; border-radius:50%;
                background:radial-gradient(circle at 30% 30%, {t['accent']} 0%, transparent 70%); opacity:.5; }}

    /* ---- asks ---- */
    .asks {{ display:flex; flex-direction:column; gap:9px; }}
    .ask {{ display:flex; gap:12px; background:{t['panel']}; border:1px solid {t['line']};
            border-radius:10px; padding:12px 14px; }}
    .ask-ic {{ flex:0 0 28px; height:28px; border-radius:50%; background:{t['accent']}; color:#fff;
               font-family:{t['head_font']}; font-weight:800; font-size:13px; text-align:center;
               line-height:28px; }}
    .ask-t {{ font-weight:700; font-size:13px; color:{t['ink']}; margin-bottom:1px; }}
    .ask-d {{ color:{t['muted']}; font-size:11px; line-height:1.5; }}

    /* ---- projects ---- */
    .proj {{ display:flex; gap:14px; align-items:flex-start; background:{t['panel']}; border:1px solid {t['line']};
             border-radius:14px; padding:14px; margin-bottom:14px; }}
    .proj .browser {{ flex:0 0 92mm; }}
    .proj-body {{ flex:1; }}
    .proj-tag {{ display:inline-block; background:{t['chip_bg']}; color:{t['chip_ink']};
                 font-size:9px; letter-spacing:1.5px; padding:3px 9px; border-radius:20px; font-weight:700; }}
    .proj-tag.alt {{ filter:none; }}
    .proj-title {{ font-family:{t['head_font']}; font-weight:800; font-size:17px; margin:8px 0 4px;
                   letter-spacing:-0.3px; color:{t['ink']}; }}
    .proj-desc {{ color:{t['muted']}; font-size:11px; margin:0 0 8px; line-height:1.5; }}
    .bul {{ display:flex; flex-direction:column; gap:3px; margin-bottom:9px; }}
    .bul span {{ font-size:10.5px; color:{t['ink']}; }}
    .bul b {{ color:{t['accent']}; }}
    .stack {{ display:flex; flex-wrap:wrap; gap:4px; }}
    .pill {{ font-size:9px; background:{t['panel2']}; border:1px solid {t['line']}; color:{t['muted']};
             padding:3px 8px; border-radius:20px; }}

    /* ---- browser frame ---- */
    .browser {{ border:1px solid {t['line']}; border-radius:9px; overflow:hidden; background:#000;
                box-shadow:0 8px 24px rgba(0,0,0,0.35); }}
    .bbar {{ background:#222; padding:6px 9px; display:flex; align-items:center; gap:5px; }}
    .dot {{ width:8px; height:8px; border-radius:50%; display:inline-block; }}
    .dot.r {{ background:#ff5f57; }} .dot.y {{ background:#febc2e; }} .dot.g {{ background:#28c840; }}
    .url {{ color:#bbb; font-size:8.5px; margin-left:8px; background:#333; padding:2px 8px;
            border-radius:10px; }}
    .screen {{ height:62mm; }}
    .screen.sushi {{ background:#0B0B0B; color:#F4ECD8; padding:0 0 4px; height:auto; }}
    .snav {{ display:flex; justify-content:space-between; align-items:center; padding:7px 11px;
             font-size:9px; border-bottom:1px solid rgba(244,236,216,0.08); }}
    .snav .logo b {{ background:#E11D2A; color:#fff; border-radius:50%; padding:1px 5px; }}
    .snav .links {{ color:#A9A294; }}
    .snav .cart {{ color:#E11D2A; }}
    .hero {{ display:flex; padding:12px 12px 6px; }}
    .heroL {{ flex:1.4; }}
    .heroR {{ flex:1; position:relative; }}
    .kicker {{ color:#E9B44C; font-style:italic; font-size:12px; margin-bottom:3px; }}
    .h1 {{ font-family:{t['head_font']}; font-weight:800; font-size:30px; line-height:.92;
           letter-spacing:-1px; color:#F4ECD8; }}
    .cta {{ margin:9px 0; }}
    .btn {{ background:#E11D2A; color:#fff; font-weight:700; font-size:9px; padding:6px 12px;
            border-radius:6px; margin-right:6px; }}
    .btn.ghost {{ background:transparent; border:1px solid rgba(244,236,216,0.3); color:#F4ECD8; }}
    .stats {{ display:flex; gap:14px; margin-top:8px; }}
    .stats div {{ display:flex; flex-direction:column; }}
    .stats b {{ font-family:{t['head_font']}; font-weight:800; font-size:16px; color:#fff; }}
    .stats span {{ font-size:7.5px; color:#A9A294; }}
    .ring {{ position:absolute; width:88px; height:88px; right:2px; top:6px; border-radius:50%;
             border:7px solid #E11D2A; opacity:.85; }}
    .plate {{ position:absolute; width:54px; height:54px; right:19px; top:23px; border-radius:50%;
              background:radial-gradient(circle at 35% 30%, #2a2a2a, #0e0e0e); border:2px solid #E9B44C; }}
    .marq {{ background:#E11D2A; color:#fff; font-weight:700; font-size:8px; letter-spacing:1px;
             padding:6px 0; text-align:center; white-space:nowrap; overflow:hidden; margin-top:6px; }}

    .screen.placeholder {{ background:linear-gradient(135deg,{t['panel2']},{t['panel']});
             display:flex; flex-direction:column; align-items:center; justify-content:center;
             text-align:center; color:{t['muted']}; }}
    .ph-badge {{ background:{t['chip_bg']}; color:{t['chip_ink']}; font-size:8px; letter-spacing:2px;
                 padding:3px 10px; border-radius:20px; font-weight:700; }}
    .ph-title {{ font-family:{t['head_font']}; font-weight:800; font-size:22px; color:{t['ink']}; margin:10px 0 6px; }}
    .ph-note {{ font-size:10px; line-height:1.6; }}
    .ph-note span {{ font-size:9px; opacity:.8; }}

    /* ---- steps ---- */
    .steps {{ display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }}
    .step {{ display:grid; grid-template-columns:34px 120px 1fr; align-items:center; gap:12px;
             background:{t['panel']}; border:1px solid {t['line']}; border-left:3px solid {t['accent']};
             border-radius:9px; padding:10px 14px; }}
    .step-n {{ font-family:{t['head_font']}; font-weight:800; font-size:18px; color:{t['accent']}; }}
    .step-t {{ font-weight:700; font-size:12.5px; color:{t['ink']}; }}
    .step-d {{ color:{t['muted']}; font-size:10.5px; line-height:1.45; }}
    .why {{ background:{t['panel']}; border:1px solid {t['line']}; border-radius:12px; padding:16px; }}
    .why-h {{ font-family:{t['head_font']}; font-weight:800; font-size:16px; margin:0 0 10px; color:{t['ink']}; }}
    .why-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:10px 18px; }}
    .why-grid div {{ display:flex; flex-direction:column; }}
    .why-grid b {{ color:{t['accent']}; font-size:12px; margin-bottom:1px; }}
    .why-grid span {{ color:{t['muted']}; font-size:10.5px; line-height:1.45; }}

    /* ---- closing ---- */
    .closing {{ background:{t['cover_bg']}; color:{t['cover_ink']}; display:flex; align-items:center; }}
    .close-wrap {{ width:100%; }}
    .close-eyebrow {{ font-family:{t['head_font']}; letter-spacing:5px; font-size:12px; opacity:.85; }}
    .close-h {{ font-family:{t['head_font']}; font-weight:800; font-size:44px; margin:8px 0 12px;
                line-height:1; letter-spacing:-1px; }}
    .close-p {{ font-size:13px; max-width:150mm; opacity:.92; line-height:1.65; }}
    .close-steps {{ display:flex; flex-direction:column; gap:7px; margin:18px 0; }}
    .close-steps div {{ font-size:12px; }}
    .close-steps b {{ display:inline-block; width:22px; height:22px; line-height:22px; text-align:center;
                      border-radius:50%; background:rgba(255,255,255,0.18); color:{t['cover_ink']};
                      margin-right:10px; font-family:{t['head_font']}; }}
    .close-card {{ margin-top:14px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.2);
                   border-radius:12px; padding:16px 18px; }}
    .cc-name {{ font-family:{t['head_font']}; font-weight:800; font-size:20px; }}
    .cc-role {{ opacity:.85; font-size:12px; margin:2px 0 8px; }}
    .cc-row {{ font-size:12px; opacity:.95; }}
    .thanks {{ margin-top:18px; font-style:italic; opacity:.8; font-size:12px; }}
    """

def build(theme_name):
    t = THEMES[theme_name]
    html = f"""<!doctype html><html><head><meta charset="utf-8">
    <style>{css(t)}</style></head><body>
    {cover()}{understanding()}{proof()}{approach()}{cta()}
    </body></html>"""
    out = os.path.join(OUT, f"Proposal-{theme_name}.pdf")
    HTML(string=html, base_url=HERE).write_pdf(out)
    print("saved", out)

if __name__ == "__main__":
    for name in THEMES:
        build(name)
    print("done")
