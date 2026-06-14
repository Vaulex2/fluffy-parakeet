# Eshitish fiziologiyasi — taqdimot

Universitet/tibbiyot darajasidagi **Auditory physiology** taqdimoti, toʻliq
**oʻzbek (lotin)** tilida. Yakuniy fayl: **`Eshitish_fiziologiyasi.pptx`** (16:9, 17 slayd).

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `content.py` | Barcha slayd matni (yagona manba), oʻzbekcha tarjima |
| `make_diagrams.py` | Maxsus chizilgan anatomik diagrammalar → `assets/*.png` |
| `build_pptx.py` | `.pptx` ni yigʻadi (python-pptx) |
| `preview_pptx.py` | Tekshirish uchun slaydlarni PNG koʻrinishida chizadi (`/tmp/preview`) |
| `assets/` | Diagramma rasmlari |

## Qayta qurish

```bash
pip install python-pptx Pillow matplotlib numpy
python make_diagrams.py     # diagrammalarni chizadi
python build_pptx.py        # Eshitish_fiziologiyasi.pptx ni yaratadi
python preview_pptx.py      # (ixtiyoriy) tekshirish koʻrinishi
```

## Mavzular

Quloq anatomiyasi (tashqi/oʻrta/ichki) · impedans moslashuvi · chigʻanoq va Korti
organi · mexanotransduksiya (endokoxlear potensial +80 mV) · bazilyar membrana va
tonotopiya · koxlear kuchaytirgich · markaziy eshitish yoʻli · tovushni idrok etish
(20 Hz – 20 kHz) · eshitish buzilishlari.

## Vizual materiallar haqida

Bu muhitda tashqi rasmlarni toʻgʻridan-toʻgʻri yuklab boʻlmaydi (tarmoq siyosati
proksi orqali bloklaydi). Shu sababli barcha diagrammalar `matplotlib`/`Pillow` bilan
**qoʻlda chizilgan** va oʻzbekcha aniq belgilangan; LibreOffice ham bu muhitda
ishlamagani uchun slaydlar `preview_pptx.py` orqali tekshirilgan.

## Manbalar

Encyclopaedia Britannica (Human ear) · NCBI StatPearls (Cochlear Function;
Auditory Pathway) · TeachMeAnatomy · UT Houston Neuroscience Online.
