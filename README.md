# SAT Vocabulary Master — Exercise PDF Generator

Generates a professional, student-friendly SAT vocabulary exercise PDF with 100 words, 100 sentence completion questions, Words in Context passages, matching exercises, and a full answer key with explanations.

## Quick Start

```bash
pip install -r requirements.txt
python sat_vocabulary_exercises.py
# → sat_vocabulary_exercises.pdf
```

## What's Inside the PDF (44 pages)

| Section | Words | Difficulty |
|---------|-------|------------|
| 1 | 1–25 | Tier 1 — Foundation |
| 2 | 26–50 | Tier 2 — Intermediate |
| 3 | 51–75 | Tier 3 — Advanced |
| 4 | 76–100 | Tier 4 — Expert |

Each section contains:
- **Vocabulary Reference Table** — word, part of speech, definition
- **Part A: Sentence Completion** — 25 questions (A–D choices)
- **Part B: Words in Context** — 2 short passages with 2 questions each
- **Part C: Matching** — 10 words matched to shuffled definitions

Plus a **full Answer Key** with one-sentence explanations for every question.

## Design

- Two-color palette: Deep Blue (`#1565C0`) + Amber (`#FFB300`)
- Built with [ReportLab](https://www.reportlab.com/) — no external fonts or assets required
