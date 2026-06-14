# -*- coding: utf-8 -*-
"""
Eshitish fiziologiyasi — taqdimot matni (Auditory physiology).
Uzbek (lotin) tilida. Yagona manba: bu fayldagi SLIDES ro'yxati.

Manbalar (research-confirmed):
  - Britannica: Human ear — Cochlea, Hair cells, Auditory pathways
  - NCBI StatPearls: Physiology, Cochlear Function; Neuroanatomy, Auditory Pathway
  - TeachMeAnatomy: The Auditory Pathway
  - UT Houston Neuroscience Online, Ch. 12–13
  - Stanford Medicine: Hearing and Hair Cells
"""

# Uzbek lotin yozuvi uchun maxsus harflar
O_ = "oʻ"   # oʻ
G_ = "gʻ"   # gʻ
o_ = O_
g_ = G_

TITLE = "Eshitish fiziologiyasi"
SUBTITLE = "Quloqning tuzilishi va tovushni idrok etish mexanizmlari"

# Har bir slayd: dict(kind, title, ...)
SLIDES = [
    # 1 — Sarlavha
    {
        "kind": "title",
        "title": TITLE,
        "subtitle": SUBTITLE,
        "meta": ["Muallif: ______________", "Sana: ______________"],
        "image": "hero",
    },

    # 2 — Reja
    {
        "kind": "agenda",
        "title": "Reja",
        "items": [
            f"Quloqning umumiy tuzilishi: tashqi, oʻrta va ichki quloq",
            "Tovushning oʻtkazilishi va impedans moslashuvi",
            "Chigʻanoq va Korti organi tuzilishi",
            "Mexanotransduksiya — mexanik signalning elektrga aylanishi",
            "Bazilyar membrana va tonotopiya",
            "Eshitish nervi va markaziy eshitish yoʻli",
            "Tovushni idrok etish va eshitish buzilishlari",
        ],
    },

    # 3 — Umumiy tuzilish
    {
        "kind": "image_bullets",
        "title": "Quloqning umumiy tuzilishi",
        "image": "ear_overview",
        "bullets": [
            ("Tashqi quloq (auris externa)", "tovushni yigʻadi va eshitish yoʻli orqali nogʻora pardaga yoʻnaltiradi."),
            ("Oʻrta quloq (auris media)", "havodagi tebranishni eshitish suyakchalari orqali ichki quloqqa uzatadi."),
            ("Ichki quloq (auris interna)", "chigʻanoqda tovush mexanik energiyasi nerv impulsiga aylanadi."),
        ],
        "footer": "Tovush yoʻli: havo → mexanik tebranish → suyuqlik toʻlqini → nerv impulsi.",
    },

    # 4 — Tashqi quloq
    {
        "kind": "bullets",
        "title": "Tashqi quloq (auris externa)",
        "bullets": [
            ("Quloq suprasi (auricula)", "tovush toʻlqinlarini yigʻadi va manbaning fazoviy joyini aniqlashga yordam beradi."),
            ("Tashqi eshitish yoʻli (meatus acusticus externus)", "uzunligi ~2.5 sm; tovushni nogʻora pardaga olib boradi."),
            ("Rezonans xususiyati", "eshitish yoʻli ~2–5 kHz chastotalarni tabiiy ravishda 10–15 dB ga kuchaytiradi — nutqni eshitish uchun muhim."),
            ("Himoya vazifasi", "quloq kiri (cerumen) va tuklar chang hamda mikroblardan himoya qiladi."),
        ],
    },

    # 5 — O'rta quloq
    {
        "kind": "image_bullets",
        "title": "Oʻrta quloq (auris media)",
        "image": "ossicles",
        "bullets": [
            ("Nogʻora parda (membrana tympani)", "tovush toʻlqinlari taʼsirida tebranadi."),
            ("Eshitish suyakchalari", "bolgʻacha (malleus) → sandon (incus) → uzangi (stapes) zanjiri tebranishni uzatadi."),
            ("Uzangi asosi", "oval oyna (fenestra ovalis) orqali ichki quloq suyuqligiga bosadi."),
            ("Mushaklar va akustik refleks", "m. tensor tympani va m. stapedius kuchli tovushda suyakchalar harakatini cheklab, ichki quloqni himoya qiladi."),
            ("Yevstaxiy nayi", "oʻrta quloq boʻshligʻidagi bosimni atmosfera bosimi bilan tenglashtiradi."),
        ],
    },

    # 6 — Impedans moslashuvi
    {
        "kind": "image_bullets",
        "title": "Impedans moslashuvi",
        "image": "impedance",
        "bullets": [
            ("Muammo", "havo (past impedans) tebranishi toʻgʻridan-toʻgʻri suyuqlikka (yuqori impedans) oʻtsa, energiyaning ~99.9% qaytarilib yoʻqoladi (~30 dB)."),
            ("Yechim — maydon nisbati", "nogʻora parda yuzasi uzangi asosidan ~17 baravar katta; bosim shuncha jamlanadi."),
            ("Richag taʼsiri", "suyakchalar richagi bosimni yana ~1.3 baravar oshiradi."),
            ("Umumiy natija", "tovush bosimi ~22 baravar (≈25–30 dB) kuchayadi — energiya yoʻqotilishi qoplanadi."),
        ],
    },

    # 7 — Ichki quloq labirint
    {
        "kind": "bullets",
        "title": "Ichki quloq — labirint",
        "bullets": [
            ("Suyak labirint", "chakka suyagi ichidagi kanallar tizimi; ichida perilimfa (yuqori Na⁺) boʻladi."),
            ("Parda labirint", "suyak labirint ichidagi pardali tuzilma; ichida endolimfa (yuqori K⁺) boʻladi."),
            ("Chigʻanoq (cochlea)", "eshitish aʼzosi — spiral shaklda ~2.5 marta oʻralgan."),
            ("Vestibulyar apparat", "yarim doira kanallari va otolit aʼzolari muvozanat (gravitatsiya, harakat) uchun — eshitishga aloqador emas."),
        ],
    },

    # 8 — Chig'anoq tuzilishi
    {
        "kind": "image_bullets",
        "title": "Chigʻanoq tuzilishi (cochlea)",
        "image": "cochlea_cross",
        "bullets": [
            ("Uchta kanal (scala)", "scala vestibuli va scala tympani — perilimfa; scala media — endolimfa."),
            ("Reissner membranasi", "scala media ni scala vestibuli dan ajratadi."),
            ("Bazilyar membrana", "scala media ni scala tympani dan ajratadi; ustida Korti organi joylashgan."),
            ("Helikotrema", "chigʻanoq choʻqqisida scala vestibuli va scala tympani ni tutashtiradi."),
        ],
    },

    # 9 — Korti organi
    {
        "kind": "image_bullets",
        "title": "Korti organi (organ of Corti)",
        "image": "organ_corti",
        "bullets": [
            ("Ichki tukli hujayralar (IHC)", "~3500 ta, bir qator; asosiy sezgi hujayralari — eshitish nervining ~95% afferent tolalari shulardan chiqadi."),
            ("Tashqi tukli hujayralar (OHC)", "~12000 ta, uch qator; tebranishni kuchaytiradi (koxlear kuchaytirgich)."),
            ("Stereosiliyalar", "tukli hujayralar ustidagi tuklar; eng uzunlari tektorial membranaga tegadi."),
            ("Tektorial va bazilyar membrana", "ular orasidagi siljish stereosiliyalarni egadi — transduksiya boshlanadi."),
        ],
    },

    # 10 — Tovushning o'tkazilishi
    {
        "kind": "steps",
        "title": "Tovushning oʻtkazilishi",
        "steps": [
            "Tovush toʻlqini eshitish yoʻliga kiradi",
            "Nogʻora parda tebranadi",
            "Suyakchalar (malleus–incus–stapes) tebranishni uzatadi",
            "Uzangi oval oynaga bosadi",
            "Perilimfada bosim toʻlqini paydo boʻladi",
            "Bazilyar membranada «yuguruvchi toʻlqin» (G. von Békésy) yuzaga keladi",
            "Tukli hujayralar qoʻzgʻaladi → nerv impulsi",
        ],
        "footer": "Yumaloq oyna (fenestra rotunda) suyuqlik harakatini muvozanatlash uchun «boʻshatadi».",
    },

    # 11 — Mexanotransduksiya
    {
        "kind": "image_bullets",
        "title": "Mexanotransduksiya",
        "image": "mechanotransduction",
        "bullets": [
            ("Stereosiliyalarning egilishi", "yuguruvchi toʻlqin stereosiliyalarni bir tomonga egadi."),
            ("Uchlararo bogʻlar (tip-link)", "qoʻshni stereosiliyalarni bogʻlab, egilishda mexanik tarang kanallarni (MET) ochadi."),
            ("K⁺ kirishi", "endolimfadagi yuqori K⁺ hujayraga kirib, uni depolarizatsiya qiladi."),
            ("Endokoxlear potensial", "scala media ~+80 mV ga zaryadlangan — K⁺ kirishi uchun kuchli harakatlantiruvchi kuch."),
            ("Neyromediator", "depolarizatsiya Ca²⁺ kanallarini ochadi → glutamat ajraladi → eshitish nervi qoʻzgʻaladi."),
        ],
    },

    # 12 — Tonotopiya
    {
        "kind": "image_bullets",
        "title": "Bazilyar membrana va tonotopiya",
        "image": "tonotopy",
        "bullets": [
            ("Asos (tor va qattiq)", "chigʻanoq asosida yuqori chastotalar (~20 kHz gacha) aks etadi."),
            ("Choʻqqi (keng va yumshoq)", "chigʻanoq choʻqqisida past chastotalar (~20 Hz) aks etadi."),
            ("Tonotopik xarita", "har bir chastota bazilyar membrananing aniq joyini maksimal tebrantiradi (joy nazariyasi)."),
            ("Ahamiyati", "bu tartib markaziy eshitish yoʻlining barcha bosqichlarida saqlanadi."),
        ],
    },

    # 13 — OHC / koxlear kuchaytirgich
    {
        "kind": "bullets",
        "title": "Tashqi tukli hujayralar — koxlear kuchaytirgich",
        "bullets": [
            ("Elektromotillik", "OHC depolarizatsiyada qisqaradi, giperpolarizatsiyada uzayadi — har bir tovush toʻlqinida uzunligini oʻzgartiradi."),
            ("Prestin oqsili", "OHC membranasidagi motor oqsil shu tez harakatni taʼminlaydi."),
            ("Kuchaytirish", "bazilyar membrana tebranishini ~100–1000 baravar (40–60 dB) kuchaytiradi va oʻtkirligini oshiradi."),
            ("Otoakustik emissiya (OAE)", "kuchaytirgich faolligi natijasida quloq oʻzi tovush chiqaradi — yangi tugʻilganlar skriningida qoʻllanadi."),
        ],
    },

    # 14 — Markaziy yo'l
    {
        "kind": "image_bullets",
        "title": "Eshitish nervi va markaziy yoʻl",
        "image": "pathway",
        "bullets": [
            ("Spiral ganglion", "tukli hujayralardan signalni oladi; aksonlari eshitish nervini (n. cochlearis, VIII) hosil qiladi."),
            ("Koʻtariluvchi yoʻl", "cochlear yadrolar → yuqori olivar kompleks → lateral lemniscus → pastki tepalik (colliculus inferior) → medial tizzasimon tana."),
            ("Eshitish poʻstlogʻi", "medial tizzasimon tanadan signal chakka boʻlagidagi birlamchi eshitish poʻstlogʻiga (Heschl pushtasi, A1) yetadi."),
            ("Ikki tomonlama tahlil", "yuqori olivar kompleks ikki quloqdan kelgan vaqt (ITD) va kuch (ILD) farqini taqqoslab, tovush manbasini aniqlaydi."),
        ],
    },

    # 15 — Idrok
    {
        "kind": "image_bullets",
        "title": "Tovushni idrok etish",
        "image": "hearing_range",
        "bullets": [
            ("Balandlik (pitch)", "chastotaga bogʻliq; joy kodlash (tonotopiya) va vaqt kodlash (fazaviy qulflanish) orqali aniqlanadi."),
            ("Kuchlilik (loudness)", "tovush intensivligiga bogʻliq; detsibel (dB) shkalasida oʻlchanadi."),
            ("Manbani aniqlash (lokalizatsiya)", "ITD — vaqt farqi (past chastota), ILD — kuch farqi (yuqori chastota)."),
            ("Eshitish diapazoni", "inson ~20 Hz – 20 kHz oraligʻini eshitadi; eng sezgir soha ~2–4 kHz (nutq)."),
        ],
    },

    # 16 — Buzilishlar
    {
        "kind": "two_col",
        "title": "Eshitish buzilishlari",
        "left_title": "Oʻtkazuvchi (konduktiv) karlik",
        "left": [
            "Tashqi yoki oʻrta quloq muammosi",
            "Quloq kiri tiqilishi, otit, nogʻora parda yorilishi",
            "Otoskleroz (suyakchalar qotishi)",
            "Koʻpincha davolanadi (dori, jarrohlik)",
        ],
        "right_title": "Sensonevral karlik",
        "right": [
            "Ichki quloq yoki eshitish nervi shikasti",
            "Presbiakuziya — yoshga bogʻliq karlik",
            "Shovqindan kelib chiqqan shikast (tukli hujayralar nobud boʻladi)",
            "Tinnitus (quloqdagi shovqin); koʻpincha qaytarilmas",
        ],
    },

    # 17 — Xulosa + manbalar
    {
        "kind": "summary",
        "title": "Xulosa",
        "points": [
            "Quloq tovush mexanik energiyasini bosqichma-bosqich nerv impulsiga aylantiradi.",
            "Oʻrta quloq impedans moslashuvi orqali energiya yoʻqotilishini qoplaydi (~25–30 dB).",
            "Tukli hujayralar mexanotransduksiya orqali eshitishni boshlaydi; OHC esa signalni kuchaytiradi.",
            "Tonotopik tartib chigʻanoqdan eshitish poʻstlogʻigacha saqlanadi.",
        ],
        "sources": [
            "Encyclopaedia Britannica — Human ear",
            "NCBI StatPearls — Physiology, Cochlear Function; Neuroanatomy, Auditory Pathway",
            "TeachMeAnatomy — The Auditory Pathway",
            "UT Houston — Neuroscience Online, Ch. 12–13",
        ],
    },
]
