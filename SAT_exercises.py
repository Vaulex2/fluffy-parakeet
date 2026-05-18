"""SAT Vocabulary Exercises PDF Generator — generates SAT_exercises.pdf"""

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas as pdfcanvas

# ---------------------------------------------------------------------------
# COLOR & FONT CONSTANTS
# ---------------------------------------------------------------------------
DEEP_BLUE   = HexColor("#1565C0")
AMBER       = HexColor("#FFB300")
LIGHT_BLUE  = HexColor("#E3F2FD")
LIGHT_AMBER = HexColor("#FFF8E1")
DARK_GRAY   = HexColor("#212121")
MID_GRAY    = HexColor("#757575")
PALE_GRAY   = HexColor("#F5F5F5")

FONT_BODY = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITAL = "Helvetica-Oblique"

# ---------------------------------------------------------------------------
# VOCABULARY DATA
# ---------------------------------------------------------------------------

TIER1_WORDS = [
    {"word": "pragmatic",    "pos": "adj.", "definition": "Dealing with things sensibly and realistically rather than ideally."},
    {"word": "ambiguous",    "pos": "adj.", "definition": "Open to more than one interpretation; not clear or decided."},
    {"word": "concise",      "pos": "adj.", "definition": "Giving a lot of information clearly and in few words."},
    {"word": "meticulous",   "pos": "adj.", "definition": "Showing great attention to detail; very careful and precise."},
    {"word": "prodigal",     "pos": "adj.", "definition": "Spending money or resources freely and recklessly; wastefully extravagant."},
    {"word": "eloquent",     "pos": "adj.", "definition": "Fluent or persuasive in speaking or writing; movingly expressive."},
    {"word": "candid",       "pos": "adj.", "definition": "Truthful and straightforward; frank and open."},
    {"word": "benevolent",   "pos": "adj.", "definition": "Well meaning and kindly; generous toward others."},
    {"word": "diligent",     "pos": "adj.", "definition": "Having or showing care and conscientiousness in one's work or duties."},
    {"word": "mundane",      "pos": "adj.", "definition": "Lacking interest or excitement; dull; of this earthly world rather than a spiritual one."},
    {"word": "versatile",    "pos": "adj.", "definition": "Able to adapt or be adapted to many different functions or activities."},
    {"word": "tenacious",    "pos": "adj.", "definition": "Holding firmly to a purpose, goal, or opinion; not readily letting go; persistent."},
    {"word": "vivid",        "pos": "adj.", "definition": "Producing powerful feelings or clear, striking images in the mind."},
    {"word": "skeptical",    "pos": "adj.", "definition": "Not easily convinced; having doubts or reservations about something."},
    {"word": "lucid",        "pos": "adj.", "definition": "Expressed clearly and easy to understand; mentally clear and rational."},
    {"word": "divert",       "pos": "v.",   "definition": "To cause to change course or redirect; to distract someone from something."},
    {"word": "mitigate",     "pos": "v.",   "definition": "To make less severe, serious, or painful; to lessen the impact of."},
    {"word": "scrutinize",   "pos": "v.",   "definition": "To examine or inspect closely and thoroughly."},
    {"word": "enhance",      "pos": "v.",   "definition": "To intensify, increase, or further improve the quality, value, or extent of."},
    {"word": "consolidate",  "pos": "v.",   "definition": "To make something stronger or more solid; to combine into a single more effective whole."},
    {"word": "depict",       "pos": "v.",   "definition": "To represent by a drawing, painting, or other art form; to portray in words."},
    {"word": "advocate",     "pos": "v./n.","definition": "To publicly recommend or support; a person who supports a particular cause or policy."},
    {"word": "critique",     "pos": "v./n.","definition": "To evaluate in a detailed and analytical way; a detailed analysis and assessment."},
    {"word": "endeavor",     "pos": "v./n.","definition": "To try hard to do or achieve something; an attempt to achieve a goal."},
    {"word": "disparity",    "pos": "n.",   "definition": "A great difference; a lack of equality or similarity between groups or things."},
]

TIER2_WORDS = [
    {"word": "recalcitrant", "pos": "adj.", "definition": "Having an obstinately uncooperative attitude toward authority or discipline."},
    {"word": "disparate",    "pos": "adj.", "definition": "Essentially different in kind; not allowing comparison; made up of very different elements."},
    {"word": "evanescent",   "pos": "adj.", "definition": "Soon passing out of sight, memory, or existence; quickly fading or disappearing."},
    {"word": "sanguine",     "pos": "adj.", "definition": "Optimistic or positive, especially in a difficult situation."},
    {"word": "pedantic",     "pos": "adj.", "definition": "Excessively concerned with minor details or rules; overly academic in approach."},
    {"word": "equivocal",    "pos": "adj.", "definition": "Open to more than one interpretation; deliberately ambiguous or unclear."},
    {"word": "loquacious",   "pos": "adj.", "definition": "Tending to talk a great deal; excessively talkative."},
    {"word": "austere",      "pos": "adj.", "definition": "Severe or strict in manner or attitude; having no comforts or luxuries; plain."},
    {"word": "venerate",     "pos": "v.",   "definition": "To regard with great respect and reverence."},
    {"word": "placate",      "pos": "v.",   "definition": "To make someone less angry or hostile; to appease or pacify."},
    {"word": "exacerbate",   "pos": "v.",   "definition": "To make a problem, bad situation, or negative feeling worse."},
    {"word": "precipitate",  "pos": "v.",   "definition": "To cause an event or situation to happen suddenly, unexpectedly, or prematurely."},
    {"word": "enumerate",    "pos": "v.",   "definition": "To mention a number of things one by one; to establish the number of."},
    {"word": "ameliorate",   "pos": "v.",   "definition": "To make something bad or unsatisfactory better; to improve."},
    {"word": "corroborate",  "pos": "v.",   "definition": "To confirm or give support to a statement, theory, or finding."},
    {"word": "ostensible",   "pos": "adj.", "definition": "Appearing or stated to be true, but not necessarily so; outwardly appearing as such."},
    {"word": "ephemeral",    "pos": "adj.", "definition": "Lasting for a very short time; transitory."},
    {"word": "pragmatism",   "pos": "n.",   "definition": "An approach that evaluates theories or beliefs in terms of their practical application."},
    {"word": "acrimony",     "pos": "n.",   "definition": "Bitterness or ill feeling, especially in speech or manner; sharp hostility."},
    {"word": "credulous",    "pos": "adj.", "definition": "Having too great a readiness to believe things without sufficient evidence; gullible."},
    {"word": "fortuitous",   "pos": "adj.", "definition": "Happening by a lucky chance rather than by intention; fortunate."},
    {"word": "laconic",      "pos": "adj.", "definition": "Using very few words; brief and concise in speech or expression."},
    {"word": "diffident",    "pos": "adj.", "definition": "Modest or shy because of a lack of self-confidence."},
    {"word": "poignant",     "pos": "adj.", "definition": "Evoking a keen sense of sadness or regret; deeply moving; touching."},
    {"word": "voluble",      "pos": "adj.", "definition": "Talking fluently, readily, or incessantly; talkative."},
]

TIER3_WORDS = [
    {"word": "obfuscate",      "pos": "v.",   "definition": "To make obscure, unclear, or unintelligible; to bewilder or confuse deliberately."},
    {"word": "perspicacious",  "pos": "adj.", "definition": "Having a ready insight into things; keenly perceptive and discerning; shrewd."},
    {"word": "circumlocution", "pos": "n.",   "definition": "The use of many words where fewer would do; indirect and roundabout speech."},
    {"word": "propitious",     "pos": "adj.", "definition": "Giving or indicating a good chance of success; favorable; auspicious."},
    {"word": "inveterate",     "pos": "adj.", "definition": "Having a particular habit, activity, or interest that is long-established and unlikely to change."},
    {"word": "perfidious",     "pos": "adj.", "definition": "Deceitful and untrustworthy; guilty of betrayal; treacherous."},
    {"word": "sophistry",      "pos": "n.",   "definition": "The use of clever but false arguments, especially with the intent to deceive."},
    {"word": "garrulous",      "pos": "adj.", "definition": "Excessively talkative, especially on trivial matters; wordy."},
    {"word": "truculent",      "pos": "adj.", "definition": "Eager or quick to argue or fight; aggressively defiant."},
    {"word": "mendacious",     "pos": "adj.", "definition": "Not telling the truth; given to lying; dishonest."},
    {"word": "sycophant",      "pos": "n.",   "definition": "A person who acts obsequiously toward someone important in order to gain advantage; a flatterer."},
    {"word": "intransigent",   "pos": "adj.", "definition": "Unwilling or refusing to change one's views or to agree; uncompromising."},
    {"word": "magnanimous",    "pos": "adj.", "definition": "Very generous or forgiving, especially toward a rival or someone less powerful."},
    {"word": "veracious",      "pos": "adj.", "definition": "Speaking or representing the truth; habitually truthful."},
    {"word": "penurious",      "pos": "adj.", "definition": "Extremely poor; poverty-stricken; also, excessively unwilling to spend."},
    {"word": "vituperate",     "pos": "v.",   "definition": "To blame or insult someone in strong or violent language; to berate harshly."},
    {"word": "inimical",       "pos": "adj.", "definition": "Tending to obstruct or harm; unfriendly; hostile in effect."},
    {"word": "specious",       "pos": "adj.", "definition": "Superficially plausible but actually wrong or misleading."},
    {"word": "supercilious",   "pos": "adj.", "definition": "Behaving or looking as though one thinks one is superior to others; disdainful."},
    {"word": "indefatigable",  "pos": "adj.", "definition": "Persisting tirelessly; incapable of being fatigued; never showing signs of tiring."},
    {"word": "querulous",      "pos": "adj.", "definition": "Complaining in a petulant or whining manner; fretful."},
    {"word": "recondite",      "pos": "adj.", "definition": "Not known by many people; obscure; dealing with abstruse subject matter."},
    {"word": "pusillanimous",  "pos": "adj.", "definition": "Showing a lack of courage or determination; timid; cowardly."},
    {"word": "pellucid",       "pos": "adj.", "definition": "Translucently clear; easily understood; lucid."},
    {"word": "impecunious",    "pos": "adj.", "definition": "Having little or no money; penniless; chronically poor."},
]

TIER4_WORDS = [
    {"word": "insouciance",   "pos": "n.",   "definition": "Casual lack of concern; indifference; a relaxed and unconcerned manner."},
    {"word": "desiccate",     "pos": "v.",   "definition": "To remove moisture from; to dry out thoroughly; to preserve by drying."},
    {"word": "obdurate",      "pos": "adj.", "definition": "Stubbornly refusing to change one's opinion or course of action; hardened."},
    {"word": "sesquipedalian","pos": "adj.", "definition": "Given to using long words; (of a word) long and ponderous."},
    {"word": "logomachy",     "pos": "n.",   "definition": "An argument about words; a dispute in which words rather than ideas are at issue."},
    {"word": "solipsism",     "pos": "n.",   "definition": "The philosophical view that the self is all that can be known to exist."},
    {"word": "tendentious",   "pos": "adj.", "definition": "Promoting a particular cause or point of view; not impartial; biased."},
    {"word": "internecine",   "pos": "adj.", "definition": "Destructive to both sides in a conflict; relating to conflict within a group."},
    {"word": "pleonasm",      "pos": "n.",   "definition": "The use of more words than are necessary for clear expression; redundancy in wording."},
    {"word": "contumacious",  "pos": "adj.", "definition": "Stubbornly or willfully disobedient to authority; rebelliously resistant."},
    {"word": "nugatory",      "pos": "adj.", "definition": "Of no value or importance; useless; having no legal force."},
    {"word": "sempiternal",   "pos": "adj.", "definition": "Eternal and unchanging; everlasting; existing through all time."},
    {"word": "lucubration",   "pos": "n.",   "definition": "Laborious study or meditation, especially at night; a piece of writing produced by such study."},
    {"word": "lassitude",     "pos": "n.",   "definition": "Physical or mental weariness; lack of energy; a state of fatigue and languor."},
    {"word": "minatory",      "pos": "adj.", "definition": "Expressing or conveying a threat; menacing; of a threatening nature."},
    {"word": "apothegm",      "pos": "n.",   "definition": "A short, witty, instructive saying; a concise formulation of a truth or principle."},
    {"word": "effulgent",     "pos": "adj.", "definition": "Radiant; shining brilliantly; resplendently bright."},
    {"word": "parlous",       "pos": "adj.", "definition": "Full of danger or uncertainty; perilous; attended with risk."},
    {"word": "compunction",   "pos": "n.",   "definition": "A feeling of guilt or moral scruple that prevents or follows wrongdoing."},
    {"word": "tenebrous",     "pos": "adj.", "definition": "Dark and gloomy; shadowy; obscure."},
    {"word": "crepuscular",   "pos": "adj.", "definition": "Of, resembling, or relating to twilight; (of animals) appearing or active at dawn or dusk."},
    {"word": "pugnacious",    "pos": "adj.", "definition": "Eager or quick to argue, quarrel, or fight; combative by disposition."},
    {"word": "sagacious",     "pos": "adj.", "definition": "Having or showing keen mental discernment and good judgment; wise."},
    {"word": "vociferous",    "pos": "adj.", "definition": "Expressing or characterized by vehement opinions; loud and forceful."},
    {"word": "ineffable",     "pos": "adj.", "definition": "Too great or extreme to be expressed or described in words; inexpressible."},
]

# ---------------------------------------------------------------------------
# SENTENCE COMPLETION DATA
# ---------------------------------------------------------------------------

SENTENCE_COMPLETION = [
    # TIER 1
    {
        "number": 1, "word": "pragmatic",
        "sentence": "Rather than proposing an idealistic plan that could never be funded, the committee chair took a ________ approach and suggested modest, achievable reforms.",
        "choices": {"A": "sentimental", "B": "pragmatic", "C": "flamboyant", "D": "pedantic"},
        "answer": "B",
        "explanation": "'Pragmatic' (sensible, realistic) contrasts with 'idealistic' — the key signal word in the sentence."
    },
    {
        "number": 2, "word": "ambiguous",
        "sentence": "The contract's wording was so ________ that both parties believed it supported their conflicting positions.",
        "choices": {"A": "definitive", "B": "transparent", "C": "ambiguous", "D": "lucid"},
        "answer": "C",
        "explanation": "When opposing parties can read contradictory meanings into the same text, the language is ambiguous — open to more than one interpretation."
    },
    {
        "number": 3, "word": "concise",
        "sentence": "A good executive summary should be ________: it must convey all critical information in no more than one page.",
        "choices": {"A": "verbose", "B": "convoluted", "C": "concise", "D": "elaborate"},
        "answer": "C",
        "explanation": "'Concise' means giving much information in few words, which matches the one-page constraint stated."
    },
    {
        "number": 4, "word": "meticulous",
        "sentence": "The forensic accountant was ________ in her review, examining every receipt, invoice, and transaction log for even the smallest discrepancy.",
        "choices": {"A": "haphazard", "B": "meticulous", "C": "cursory", "D": "negligent"},
        "answer": "B",
        "explanation": "Examining every document for the smallest discrepancy exemplifies meticulousness — great attention to detail."
    },
    {
        "number": 5, "word": "prodigal",
        "sentence": "His ________ spending habits left him bankrupt within two years of inheriting a substantial fortune.",
        "choices": {"A": "frugal", "B": "prudent", "C": "prodigal", "D": "meager"},
        "answer": "C",
        "explanation": "'Prodigal' means wastefully extravagant; spending an entire fortune in two years fits perfectly."
    },
    {
        "number": 6, "word": "eloquent",
        "sentence": "The attorney's closing argument was so ________ that several jurors were visibly moved and the judge praised its clarity.",
        "choices": {"A": "rambling", "B": "eloquent", "C": "terse", "D": "incoherent"},
        "answer": "B",
        "explanation": "Moving jurors and earning the judge's praise for clarity describes eloquence — fluent, persuasive, emotionally resonant speech."
    },
    {
        "number": 7, "word": "candid",
        "sentence": "Surprisingly ________ for a politician, she admitted that her previous policy position had been wrong and outlined how she planned to change it.",
        "choices": {"A": "evasive", "B": "candid", "C": "guarded", "D": "circumspect"},
        "answer": "B",
        "explanation": "Publicly admitting being wrong is candid — truthful and straightforward, especially when it is difficult to be so."
    },
    {
        "number": 8, "word": "benevolent",
        "sentence": "The ________ donor wished to remain anonymous; he simply wanted to ensure that every child in the district had access to school supplies.",
        "choices": {"A": "miserly", "B": "malevolent", "C": "benevolent", "D": "indifferent"},
        "answer": "C",
        "explanation": "Giving anonymously to benefit children is benevolent — well meaning and generous."
    },
    {
        "number": 9, "word": "diligent",
        "sentence": "Only the most ________ students consistently complete every reading assignment, attend every study session, and review their notes that same day.",
        "choices": {"A": "indolent", "B": "diligent", "C": "capricious", "D": "lethargic"},
        "answer": "B",
        "explanation": "Completing all assignments and study sessions consistently describes diligence — careful and conscientious effort."
    },
    {
        "number": 10, "word": "mundane",
        "sentence": "After years of high-stakes diplomatic work, she found answering routine emails unexpectedly ________.",
        "choices": {"A": "thrilling", "B": "complex", "C": "mundane", "D": "enriching"},
        "answer": "C",
        "explanation": "Routine emails following high-stakes work would feel dull and ordinary — mundane."
    },
    {
        "number": 11, "word": "versatile",
        "sentence": "The software proved remarkably ________: it was used equally by architects designing skyscrapers and students mapping family trees.",
        "choices": {"A": "rigid", "B": "versatile", "C": "specialized", "D": "obsolete"},
        "answer": "B",
        "explanation": "Working for completely different use cases shows the software adapts to many functions — the definition of versatile."
    },
    {
        "number": 12, "word": "tenacious",
        "sentence": "Despite three rejections from publishers, the ________ novelist revised her manuscript and submitted it a fourth time — and was finally offered a contract.",
        "choices": {"A": "resigned", "B": "tenacious", "C": "fickle", "D": "indifferent"},
        "answer": "B",
        "explanation": "Revising and resubmitting after repeated rejection shows tenacity — persistent, firm adherence to a purpose."
    },
    {
        "number": 13, "word": "vivid",
        "sentence": "Her ________ description of the rainforest — the cacophony of insects, the thick humid air, the blinding green light — made readers feel they were there.",
        "choices": {"A": "vague", "B": "tepid", "C": "abstract", "D": "vivid"},
        "answer": "D",
        "explanation": "A description so detailed it places readers inside the scene is vivid — producing powerful and clear mental images."
    },
    {
        "number": 14, "word": "skeptical",
        "sentence": "The journalist remained ________ of the company's optimistic press release, insisting on seeing the raw data before writing her story.",
        "choices": {"A": "credulous", "B": "trustful", "C": "skeptical", "D": "compliant"},
        "answer": "C",
        "explanation": "Refusing to accept the press release at face value and demanding evidence describes skepticism."
    },
    {
        "number": 15, "word": "lucid",
        "sentence": "The professor's ________ explanation of quantum entanglement made the concept accessible even to students with no physics background.",
        "choices": {"A": "muddled", "B": "convoluted", "C": "lucid", "D": "abstruse"},
        "answer": "C",
        "explanation": "Making a difficult concept accessible to non-specialists describes a lucid explanation — clear and easy to understand."
    },
    {
        "number": 16, "word": "divert",
        "sentence": "The magician uses elaborate hand gestures to ________ the audience's attention while secretly palming the card.",
        "choices": {"A": "focus", "B": "divert", "C": "concentrate", "D": "intensify"},
        "answer": "B",
        "explanation": "Redirecting attention away from the secret action is to divert — to cause a change of course or to distract."
    },
    {
        "number": 17, "word": "mitigate",
        "sentence": "Installing flood barriers will not eliminate the risk entirely, but it will significantly ________ the damage caused by storm surges.",
        "choices": {"A": "exacerbate", "B": "amplify", "C": "mitigate", "D": "accelerate"},
        "answer": "C",
        "explanation": "Reducing but not eliminating damage describes mitigation — making something less severe."
    },
    {
        "number": 18, "word": "scrutinize",
        "sentence": "Safety inspectors ________ every weld joint in the bridge structure before clearing it for public use.",
        "choices": {"A": "overlook", "B": "scrutinize", "C": "ignore", "D": "estimate"},
        "answer": "B",
        "explanation": "Examining every weld joint is to scrutinize — to inspect closely and thoroughly."
    },
    {
        "number": 19, "word": "enhance",
        "sentence": "Adding a dash of lemon zest will ________ the flavor of the sauce, bringing out the subtler herbal notes.",
        "choices": {"A": "diminish", "B": "neutralize", "C": "enhance", "D": "suppress"},
        "answer": "C",
        "explanation": "Intensifying and improving flavors is to enhance — to increase quality or value."
    },
    {
        "number": 20, "word": "consolidate",
        "sentence": "The merger was designed to ________ three regional offices into a single national headquarters, reducing overhead and improving coordination.",
        "choices": {"A": "fragment", "B": "scatter", "C": "consolidate", "D": "diversify"},
        "answer": "C",
        "explanation": "Combining three offices into one is consolidation — making stronger by combining into one."
    },
    {
        "number": 21, "word": "depict",
        "sentence": "The mural was commissioned to ________ the town's history from its founding as a fishing village to its current role as a technology hub.",
        "choices": {"A": "ignore", "B": "conceal", "C": "depict", "D": "contradict"},
        "answer": "C",
        "explanation": "Showing historical scenes in a mural is to depict — to represent or portray."
    },
    {
        "number": 22, "word": "advocate",
        "sentence": "The pediatrician used every public platform available to ________ for stricter regulations on sugar content in children's beverages.",
        "choices": {"A": "oppose", "B": "advocate", "C": "dismiss", "D": "neglect"},
        "answer": "B",
        "explanation": "Using public platforms to support a cause is to advocate — to publicly recommend or champion."
    },
    {
        "number": 23, "word": "critique",
        "sentence": "The writing workshop requires each participant to ________ two peers' essays, offering specific suggestions for improvement.",
        "choices": {"A": "plagiarize", "B": "ignore", "C": "critique", "D": "transcribe"},
        "answer": "C",
        "explanation": "Offering specific improvement suggestions after analysis is to critique — to evaluate in a detailed and analytical way."
    },
    {
        "number": 24, "word": "endeavor",
        "sentence": "Despite limited resources, the research team would ________ to publish their findings before the end of the fiscal year.",
        "choices": {"A": "decline", "B": "endeavor", "C": "neglect", "D": "abandon"},
        "answer": "B",
        "explanation": "Trying hard to achieve a goal despite obstacles is to endeavor."
    },
    {
        "number": 25, "word": "disparity",
        "sentence": "The report documented a troubling ________ in graduation rates between students from wealthy districts and those from low-income areas.",
        "choices": {"A": "similarity", "B": "disparity", "C": "uniformity", "D": "harmony"},
        "answer": "B",
        "explanation": "A troubling difference in rates between two groups is a disparity — a great difference or inequality."
    },
    # TIER 2
    {
        "number": 26, "word": "recalcitrant",
        "sentence": "Even after three warnings from the principal, the ________ student refused to remove his headphones during the exam.",
        "choices": {"A": "compliant", "B": "obedient", "C": "recalcitrant", "D": "amenable"},
        "answer": "C",
        "explanation": "Refusing to comply despite repeated warnings from authority describes recalcitrance — obstinately uncooperative."
    },
    {
        "number": 27, "word": "disparate",
        "sentence": "The team was composed of ________ professionals — a neuroscientist, a jazz musician, a retired general, and a chef — yet they produced a cohesive plan.",
        "choices": {"A": "homogeneous", "B": "uniform", "C": "disparate", "D": "similar"},
        "answer": "C",
        "explanation": "Professionals from completely different fields are disparate — essentially different in kind, not easily compared."
    },
    {
        "number": 28, "word": "evanescent",
        "sentence": "Morning fog is inherently ________: it burns off within hours of sunrise, leaving no trace of its brief dominance.",
        "choices": {"A": "permanent", "B": "evanescent", "C": "enduring", "D": "persistent"},
        "answer": "B",
        "explanation": "Burning off within hours and leaving no trace is evanescence — soon passing out of existence."
    },
    {
        "number": 29, "word": "sanguine",
        "sentence": "Despite the poor early sales figures, the CEO remained ________ about the product's long-term prospects, citing favorable demographic trends.",
        "choices": {"A": "pessimistic", "B": "despondent", "C": "sanguine", "D": "resigned"},
        "answer": "C",
        "explanation": "Remaining optimistic about long-term prospects despite bad early numbers is to be sanguine."
    },
    {
        "number": 30, "word": "pedantic",
        "sentence": "His ________ insistence on correcting every grammatical slip in casual conversation made him difficult to talk to at parties.",
        "choices": {"A": "casual", "B": "flexible", "C": "pedantic", "D": "relaxed"},
        "answer": "C",
        "explanation": "Obsessively correcting grammar in casual settings is pedantic — excessively concerned with minor rules."
    },
    {
        "number": 31, "word": "equivocal",
        "sentence": "The spokesperson's ________ answer — 'We are committed to best practices' — satisfied no one, since it could mean almost anything.",
        "choices": {"A": "direct", "B": "definitive", "C": "equivocal", "D": "forthright"},
        "answer": "C",
        "explanation": "A statement that could mean almost anything is equivocal — deliberately open to multiple interpretations."
    },
    {
        "number": 32, "word": "loquacious",
        "sentence": "The ________ tour guide spoke continuously for three hours, barely pausing for breath even when tourists clearly wanted to take photos.",
        "choices": {"A": "taciturn", "B": "reticent", "C": "loquacious", "D": "laconic"},
        "answer": "C",
        "explanation": "Speaking continuously for hours without pausing is loquacious — tending to talk a great deal."
    },
    {
        "number": 33, "word": "austere",
        "sentence": "The monk's cell was ________: a straw mattress, a wooden stool, and a single candle constituted all his possessions.",
        "choices": {"A": "lavish", "B": "opulent", "C": "austere", "D": "ornate"},
        "answer": "C",
        "explanation": "A bare room with minimal possessions describes austerity — severe, lacking comforts or luxuries."
    },
    {
        "number": 34, "word": "venerate",
        "sentence": "In many cultures, elders are ________ for their wisdom and life experience, and their counsel is sought before major decisions.",
        "choices": {"A": "belittled", "B": "venerated", "C": "ridiculed", "D": "dismissed"},
        "answer": "B",
        "explanation": "Seeking someone's counsel because of deep respect is to venerate — to regard with great respect and reverence."
    },
    {
        "number": 35, "word": "placate",
        "sentence": "Management offered the striking workers a modest raise in an attempt to ________ them, though the union deemed it insufficient.",
        "choices": {"A": "antagonize", "B": "provoke", "C": "placate", "D": "agitate"},
        "answer": "C",
        "explanation": "Offering something to reduce hostility is to placate — to make someone less angry or hostile."
    },
    {
        "number": 36, "word": "exacerbate",
        "sentence": "Cutting funding to mental health services during an economic downturn would only ________ an already critical shortage of resources.",
        "choices": {"A": "alleviate", "B": "exacerbate", "C": "mitigate", "D": "ameliorate"},
        "answer": "B",
        "explanation": "Making an already critical shortage worse is to exacerbate — to make a bad situation worse."
    },
    {
        "number": 37, "word": "precipitate",
        "sentence": "The leaked memo threatened to ________ a full-scale crisis just days before the annual shareholder meeting.",
        "choices": {"A": "prevent", "B": "delay", "C": "precipitate", "D": "resolve"},
        "answer": "C",
        "explanation": "Causing a crisis to happen suddenly and prematurely is to precipitate it."
    },
    {
        "number": 38, "word": "enumerate",
        "sentence": "Before beginning the experiment, the lead researcher carefully ________ the safety protocols that all team members were required to follow.",
        "choices": {"A": "disregarded", "B": "enumerated", "C": "obscured", "D": "contradicted"},
        "answer": "B",
        "explanation": "Carefully listing safety protocols one by one is to enumerate them."
    },
    {
        "number": 39, "word": "ameliorate",
        "sentence": "The new drainage system was designed to ________ flooding conditions in the low-lying neighborhoods that had suffered repeatedly.",
        "choices": {"A": "worsen", "B": "perpetuate", "C": "ameliorate", "D": "exacerbate"},
        "answer": "C",
        "explanation": "Designing a system to improve flooding conditions is to ameliorate — to make something bad better."
    },
    {
        "number": 40, "word": "corroborate",
        "sentence": "The second eyewitness account served to ________ the first witness's claim that the suspect had been seen leaving the building at midnight.",
        "choices": {"A": "contradict", "B": "undermine", "C": "corroborate", "D": "negate"},
        "answer": "C",
        "explanation": "A second account that confirms the first is corroborating evidence."
    },
    {
        "number": 41, "word": "ostensible",
        "sentence": "His ________ reason for the late-night visit was returning a borrowed book, but his real motivation was to check whether his colleague was working late.",
        "choices": {"A": "genuine", "B": "ostensible", "C": "sincere", "D": "transparent"},
        "answer": "B",
        "explanation": "The stated reason that may not reflect the true reason is the ostensible reason — appearing to be true but not necessarily so."
    },
    {
        "number": 42, "word": "ephemeral",
        "sentence": "Social media trends are notoriously ________: a meme that dominates every feed on Monday is forgotten entirely by Friday.",
        "choices": {"A": "enduring", "B": "permanent", "C": "ephemeral", "D": "timeless"},
        "answer": "C",
        "explanation": "A trend forgotten in days is ephemeral — lasting for a very short time."
    },
    {
        "number": 43, "word": "pragmatism",
        "sentence": "Her ________ was evident when she abandoned the theoretically optimal solution in favor of one that could actually be implemented by Monday.",
        "choices": {"A": "idealism", "B": "pragmatism", "C": "romanticism", "D": "dogmatism"},
        "answer": "B",
        "explanation": "Choosing what is workable over what is theoretically optimal reflects pragmatism — valuing practical application."
    },
    {
        "number": 44, "word": "acrimony",
        "sentence": "What had begun as a collegial disagreement devolved into personal ________, with both sides exchanging bitter accusations in the press.",
        "choices": {"A": "goodwill", "B": "camaraderie", "C": "acrimony", "D": "warmth"},
        "answer": "C",
        "explanation": "Personal bitterness and hostile accusations describe acrimony — ill feeling and bitterness in speech or manner."
    },
    {
        "number": 45, "word": "credulous",
        "sentence": "The ________ investor lost his savings to a scheme that promised a 40% monthly return — a claim any skeptic would have immediately questioned.",
        "choices": {"A": "skeptical", "B": "cautious", "C": "credulous", "D": "discerning"},
        "answer": "C",
        "explanation": "Believing a clearly implausible promise without question is credulous — too ready to believe things."
    },
    {
        "number": 46, "word": "fortuitous",
        "sentence": "Running into her former professor at the conference was entirely ________: neither had planned to attend, yet that chance meeting launched a major collaboration.",
        "choices": {"A": "planned", "B": "deliberate", "C": "fortuitous", "D": "contrived"},
        "answer": "C",
        "explanation": "A lucky, unplanned meeting that leads to something positive is fortuitous — happening by lucky chance."
    },
    {
        "number": 47, "word": "laconic",
        "sentence": "True to his ________ reputation, the general's entire battle plan was summarized in three sentences.",
        "choices": {"A": "verbose", "B": "laconic", "C": "loquacious", "D": "garrulous"},
        "answer": "B",
        "explanation": "Summarizing a battle plan in three sentences reflects laconicism — using very few words."
    },
    {
        "number": 48, "word": "diffident",
        "sentence": "Though she possessed genuine expertise, her ________ manner in meetings — rarely volunteering opinions, always deferring to others — masked her true abilities.",
        "choices": {"A": "assertive", "B": "diffident", "C": "domineering", "D": "confident"},
        "answer": "B",
        "explanation": "Rarely volunteering opinions and deferring to others from lack of self-confidence is diffident behavior."
    },
    {
        "number": 49, "word": "poignant",
        "sentence": "The documentary's final scene — a soldier returning home to a daughter who had grown up without him — was deeply ________.",
        "choices": {"A": "trivial", "B": "tedious", "C": "poignant", "D": "mundane"},
        "answer": "C",
        "explanation": "A scene that evokes a keen sense of sadness and emotional resonance is poignant."
    },
    {
        "number": 50, "word": "voluble",
        "sentence": "The ________ salesman barely paused for breath as he transitioned from praising the car's fuel efficiency to its safety ratings to its resale value.",
        "choices": {"A": "taciturn", "B": "voluble", "C": "reticent", "D": "morose"},
        "answer": "B",
        "explanation": "Talking incessantly and fluently without pause is voluble behavior — talkative and flowing."
    },
    # TIER 3
    {
        "number": 51, "word": "obfuscate",
        "sentence": "Critics accused the company of using technical jargon deliberately to ________ the true cost of its subscription plans.",
        "choices": {"A": "clarify", "B": "illuminate", "C": "obfuscate", "D": "simplify"},
        "answer": "C",
        "explanation": "Using jargon deliberately to hide the true cost is to obfuscate — to make obscure or unintelligible."
    },
    {
        "number": 52, "word": "perspicacious",
        "sentence": "A ________ observer would have noticed that the witness contradicted herself three times — details that the less experienced attorney overlooked entirely.",
        "choices": {"A": "oblivious", "B": "perspicacious", "C": "inattentive", "D": "naive"},
        "answer": "B",
        "explanation": "Noticing subtle contradictions others miss describes perspicacity — keenly perceptive and discerning."
    },
    {
        "number": 53, "word": "circumlocution",
        "sentence": "Instead of simply saying the company had lost money, the CFO resorted to ________, spending ten minutes on 'revenue optimization challenges and margin compression events.'",
        "choices": {"A": "brevity", "B": "circumlocution", "C": "candor", "D": "precision"},
        "answer": "B",
        "explanation": "Using many words where 'the company lost money' would suffice is circumlocution — indirect and verbose expression."
    },
    {
        "number": 54, "word": "propitious",
        "sentence": "With inflation falling and consumer confidence rising, the economic climate seemed ________ for launching a new retail venture.",
        "choices": {"A": "inauspicious", "B": "ominous", "C": "propitious", "D": "bleak"},
        "answer": "C",
        "explanation": "A favorable economic climate that gives a good chance of success is propitious."
    },
    {
        "number": 55, "word": "inveterate",
        "sentence": "An ________ traveler, she had visited every country in South America and was already planning her second circuit of Southeast Asia.",
        "choices": {"A": "occasional", "B": "reluctant", "C": "inveterate", "D": "sporadic"},
        "answer": "C",
        "explanation": "A deeply rooted, long-established habit of traveling describes an inveterate traveler."
    },
    {
        "number": 56, "word": "perfidious",
        "sentence": "The general's ________ aide had been secretly passing troop positions to the enemy for months before being caught.",
        "choices": {"A": "loyal", "B": "trustworthy", "C": "perfidious", "D": "faithful"},
        "answer": "C",
        "explanation": "Secretly betraying one's commander to the enemy is perfidious — deceitful and guilty of betrayal."
    },
    {
        "number": 57, "word": "sophistry",
        "sentence": "His argument sounded persuasive at first, but under examination it was pure ________: the statistics had been cherry-picked to mislead.",
        "choices": {"A": "logic", "B": "sophistry", "C": "reasoning", "D": "evidence"},
        "answer": "B",
        "explanation": "A clever-sounding argument that is actually misleading is sophistry — false argument designed to deceive."
    },
    {
        "number": 58, "word": "garrulous",
        "sentence": "The ________ neighbor would appear at the door for what she described as 'a quick question' and remain for two hours.",
        "choices": {"A": "taciturn", "B": "reserved", "C": "garrulous", "D": "reclusive"},
        "answer": "C",
        "explanation": "Talking excessively about trivial matters is garrulous behavior."
    },
    {
        "number": 59, "word": "truculent",
        "sentence": "The coach became ________ when the referee made a controversial call, storming onto the field and shouting until ejected from the game.",
        "choices": {"A": "placid", "B": "serene", "C": "truculent", "D": "composed"},
        "answer": "C",
        "explanation": "Aggressively arguing and getting ejected describes truculence — eager and quick to fight or argue."
    },
    {
        "number": 60, "word": "mendacious",
        "sentence": "The investigation revealed that the company's press releases had been consistently ________, overstating profits and hiding debt.",
        "choices": {"A": "accurate", "B": "mendacious", "C": "candid", "D": "veracious"},
        "answer": "B",
        "explanation": "Overstating profits and hiding debt in press releases is mendacious — not telling the truth; dishonest."
    },
    {
        "number": 61, "word": "sycophant",
        "sentence": "Every time the executive walked into the room, his team of ________ rushed to agree with whatever opinion he expressed, regardless of its merit.",
        "choices": {"A": "critics", "B": "sycophants", "C": "adversaries", "D": "skeptics"},
        "answer": "B",
        "explanation": "People who agree with everything their superior says to gain favor are sycophants — obsequious flatterers."
    },
    {
        "number": 62, "word": "intransigent",
        "sentence": "Negotiations collapsed because both sides were ________: neither would give an inch, even on points that clearly required compromise.",
        "choices": {"A": "flexible", "B": "accommodating", "C": "intransigent", "D": "conciliatory"},
        "answer": "C",
        "explanation": "Refusing to change positions or compromise is intransigence — unwilling to agree."
    },
    {
        "number": 63, "word": "magnanimous",
        "sentence": "After winning the championship, the coach was ________ in victory, praising the opposing team's performance and refusing to gloat.",
        "choices": {"A": "petty", "B": "vindictive", "C": "magnanimous", "D": "churlish"},
        "answer": "C",
        "explanation": "Praising opponents in victory rather than gloating is magnanimous — very generous or forgiving toward a rival."
    },
    {
        "number": 64, "word": "veracious",
        "sentence": "History has vindicated her as a ________ journalist: every claim in her controversial report has since been independently verified.",
        "choices": {"A": "mendacious", "B": "deceptive", "C": "veracious", "D": "dishonest"},
        "answer": "C",
        "explanation": "Someone whose every claim is verified is veracious — habitually truthful."
    },
    {
        "number": 65, "word": "penurious",
        "sentence": "Despite his family's ________ circumstances, he refused charity, instead working three jobs to put himself through college.",
        "choices": {"A": "affluent", "B": "prosperous", "C": "penurious", "D": "comfortable"},
        "answer": "C",
        "explanation": "Working three jobs because charity is the only alternative suggests extreme poverty — penurious circumstances."
    },
    {
        "number": 66, "word": "vituperate",
        "sentence": "The columnist ________ the administration for what he called its systematic dismantling of environmental protections, using language rarely seen in a mainstream newspaper.",
        "choices": {"A": "praised", "B": "vituperated", "C": "commended", "D": "lauded"},
        "answer": "B",
        "explanation": "Attacking with strong and violent language is to vituperate — to blame or insult using harsh speech."
    },
    {
        "number": 67, "word": "inimical",
        "sentence": "Chronic sleep deprivation is ________ to cognitive performance; students who consistently sleep fewer than six hours score measurably lower on memory tests.",
        "choices": {"A": "beneficial", "B": "conducive", "C": "inimical", "D": "favorable"},
        "answer": "C",
        "explanation": "Something that harms or obstructs a process is inimical to it — tending to obstruct or harm."
    },
    {
        "number": 68, "word": "specious",
        "sentence": "The lobbyist's ________ argument that pollution controls would destroy jobs sounded reasonable, but studies consistently showed the opposite effect.",
        "choices": {"A": "rigorous", "B": "specious", "C": "cogent", "D": "irrefutable"},
        "answer": "B",
        "explanation": "An argument that sounds plausible but is actually wrong or misleading is specious."
    },
    {
        "number": 69, "word": "supercilious",
        "sentence": "The sommelier's ________ sneer at the customer's choice of house wine made the entire table deeply uncomfortable.",
        "choices": {"A": "humble", "B": "supercilious", "C": "deferential", "D": "gracious"},
        "answer": "B",
        "explanation": "Sneering at someone's choice as if one is superior is supercilious behavior — disdainful and condescending."
    },
    {
        "number": 70, "word": "indefatigable",
        "sentence": "An ________ advocate for prison reform, she delivered over three hundred speeches across twenty states in a single year without slowing her pace.",
        "choices": {"A": "sluggish", "B": "indolent", "C": "indefatigable", "D": "lethargic"},
        "answer": "C",
        "explanation": "Delivering hundreds of speeches without slowing describes indefatigable effort — persisting tirelessly."
    },
    {
        "number": 71, "word": "querulous",
        "sentence": "The ________ patient complained about the room temperature, the food, the noise, and finally the shape of the pillow, exhausting even the most patient nurses.",
        "choices": {"A": "stoic", "B": "querulous", "C": "serene", "D": "resigned"},
        "answer": "B",
        "explanation": "Constant complaining about every small thing is querulous behavior — petulant and whining."
    },
    {
        "number": 72, "word": "recondite",
        "sentence": "His dissertation explored the ________ connections between medieval Flemish tax law and double-entry bookkeeping — a topic few outside his field had heard of.",
        "choices": {"A": "well-known", "B": "recondite", "C": "mainstream", "D": "familiar"},
        "answer": "B",
        "explanation": "A topic not known by many people — connections between obscure medieval subjects — is recondite."
    },
    {
        "number": 73, "word": "pusillanimous",
        "sentence": "His ________ response to the bullying — walking away without a word and never reporting it — only encouraged further mistreatment.",
        "choices": {"A": "courageous", "B": "pusillanimous", "C": "valiant", "D": "audacious"},
        "answer": "B",
        "explanation": "Avoiding confrontation out of timidity is pusillanimous — showing a lack of courage or determination."
    },
    {
        "number": 74, "word": "pellucid",
        "sentence": "The legal brief was unusually ________ for such a complex case; even lay readers could follow the reasoning without legal training.",
        "choices": {"A": "convoluted", "B": "opaque", "C": "pellucid", "D": "abstruse"},
        "answer": "C",
        "explanation": "Writing so clear that non-experts can follow it is pellucid — translucently clear; easily understood."
    },
    {
        "number": 75, "word": "impecunious",
        "sentence": "The ________ graduate student subsisted on instant noodles and library coffee while completing her dissertation, unable to afford even basic luxuries.",
        "choices": {"A": "affluent", "B": "wealthy", "C": "impecunious", "D": "prosperous"},
        "answer": "C",
        "explanation": "Unable to afford basic luxuries is impecunious — having little or no money."
    },
    # TIER 4
    {
        "number": 76, "word": "insouciance",
        "sentence": "He accepted the news of his demotion with an ________ that unnerved his supervisor, shrugging and asking what time lunch was served.",
        "choices": {"A": "anguish", "B": "insouciance", "C": "consternation", "D": "distress"},
        "answer": "B",
        "explanation": "Responding to serious news with a shrug and asking about lunch is the very image of insouciance — casual indifference."
    },
    {
        "number": 77, "word": "desiccate",
        "sentence": "Left in the kiln too long, the clay figurines began to ________ and crack along hairline fractures.",
        "choices": {"A": "moisten", "B": "saturate", "C": "desiccate", "D": "hydrate"},
        "answer": "C",
        "explanation": "Drying out and cracking in a kiln is to desiccate — to remove moisture; to dry out thoroughly."
    },
    {
        "number": 78, "word": "obdurate",
        "sentence": "Despite overwhelming evidence to the contrary, the scientist remained ________ in her original hypothesis, refusing to revise her model.",
        "choices": {"A": "flexible", "B": "obdurate", "C": "open-minded", "D": "receptive"},
        "answer": "B",
        "explanation": "Refusing to change one's position despite overwhelming contrary evidence is obdurate stubbornness."
    },
    {
        "number": 79, "word": "sesquipedalian",
        "sentence": "The professor's ________ lecture style — peppered with words like 'heterophenomenology' and 'transubstantiation' — alienated undergraduates.",
        "choices": {"A": "simple", "B": "sesquipedalian", "C": "accessible", "D": "elementary"},
        "answer": "B",
        "explanation": "Using very long, complex words in a lecture is sesquipedalian — given to using long words."
    },
    {
        "number": 80, "word": "logomachy",
        "sentence": "The two philosophers spent an entire symposium in ________, debating whether 'knowledge' required 'certainty' without agreeing on what either word meant.",
        "choices": {"A": "consensus", "B": "logomachy", "C": "collaboration", "D": "harmony"},
        "answer": "B",
        "explanation": "An argument revolving entirely around the meaning of words rather than underlying concepts is logomachy."
    },
    {
        "number": 81, "word": "solipsism",
        "sentence": "His critics accused him of ________, arguing that he wrote exclusively from his own perspective and seemed incapable of imagining any other existence.",
        "choices": {"A": "altruism", "B": "solipsism", "C": "empathy", "D": "generosity"},
        "answer": "B",
        "explanation": "Being incapable of imagining any reality beyond one's own reflects solipsism — the view that only the self can be known."
    },
    {
        "number": 82, "word": "tendentious",
        "sentence": "The documentary was widely criticized as ________ because it presented only evidence supporting one side and omitted contradictory findings entirely.",
        "choices": {"A": "balanced", "B": "tendentious", "C": "objective", "D": "impartial"},
        "answer": "B",
        "explanation": "Presenting only one side while omitting contradictory evidence is tendentious — biased toward a particular viewpoint."
    },
    {
        "number": 83, "word": "internecine",
        "sentence": "The ________ struggle between the party's two factions damaged both wings so severely that the opposition won a landslide victory.",
        "choices": {"A": "cooperative", "B": "internecine", "C": "productive", "D": "beneficial"},
        "answer": "B",
        "explanation": "A conflict that damages both sides — both party factions harming each other — is internecine."
    },
    {
        "number": 84, "word": "pleonasm",
        "sentence": "'Free gift' is a classic example of ________: since gifts are by definition free, the word 'free' is entirely redundant.",
        "choices": {"A": "precision", "B": "pleonasm", "C": "economy", "D": "ambiguity"},
        "answer": "B",
        "explanation": "Using more words than necessary when one word would suffice is pleonasm — redundancy in wording."
    },
    {
        "number": 85, "word": "contumacious",
        "sentence": "The ________ prisoner refused to stand when the judge entered, ignored three direct orders from bailiffs, and had to be physically restrained.",
        "choices": {"A": "deferential", "B": "obedient", "C": "contumacious", "D": "compliant"},
        "answer": "C",
        "explanation": "Stubbornly disobeying multiple direct orders from authority figures is contumacious behavior."
    },
    {
        "number": 86, "word": "nugatory",
        "sentence": "The amendment was ________: it had been so heavily revised to win votes that it no longer addressed the problem it was designed to solve.",
        "choices": {"A": "vital", "B": "nugatory", "C": "consequential", "D": "significant"},
        "answer": "B",
        "explanation": "Something revised into uselessness is nugatory — of no value or importance."
    },
    {
        "number": 87, "word": "sempiternal",
        "sentence": "The philosopher argued that mathematical truths are ________: they do not exist in time and cannot be changed by physical events.",
        "choices": {"A": "transient", "B": "sempiternal", "C": "ephemeral", "D": "fleeting"},
        "answer": "B",
        "explanation": "Mathematical truths that are eternal and unchanging are sempiternal — everlasting and unchangeable."
    },
    {
        "number": 88, "word": "lucubration",
        "sentence": "The final chapter bore the marks of years of ________: every paragraph was dense with cross-references, footnotes, and labored argumentation.",
        "choices": {"A": "improvisation", "B": "lucubration", "C": "negligence", "D": "carelessness"},
        "answer": "B",
        "explanation": "Dense paragraphs full of cross-references produced over years of laborious study are the product of lucubration."
    },
    {
        "number": 89, "word": "lassitude",
        "sentence": "A profound ________ overcame the team after months of seventy-hour weeks; even the most dedicated members struggled to concentrate.",
        "choices": {"A": "energy", "B": "vigor", "C": "lassitude", "D": "exhilaration"},
        "answer": "C",
        "explanation": "Mental and physical weariness after sustained overwork is lassitude — lack of energy."
    },
    {
        "number": 90, "word": "minatory",
        "sentence": "The landlord's ________ letter warned tenants that any further noise complaints would result in immediate eviction proceedings.",
        "choices": {"A": "reassuring", "B": "minatory", "C": "welcoming", "D": "encouraging"},
        "answer": "B",
        "explanation": "A letter warning of immediate eviction is minatory — expressing or conveying a threat."
    },
    {
        "number": 91, "word": "apothegm",
        "sentence": "'Do not multiply entities beyond necessity' — known as Occam's Razor — is perhaps the most influential ________ in the history of science.",
        "choices": {"A": "contradiction", "B": "apothegm", "C": "fallacy", "D": "paradox"},
        "answer": "B",
        "explanation": "A short, witty, instructive saying with lasting influence is an apothegm."
    },
    {
        "number": 92, "word": "effulgent",
        "sentence": "The cathedral's rose window was ________ in the afternoon light, casting pools of crimson and gold across the stone floor.",
        "choices": {"A": "dim", "B": "effulgent", "C": "shadowy", "D": "murky"},
        "answer": "B",
        "explanation": "A window shining brilliantly and casting pools of light is effulgent — radiant; shining brightly."
    },
    {
        "number": 93, "word": "parlous",
        "sentence": "The expedition's ________ state became clear when the team's last radio broke, supplies ran low, and a storm system closed in from the north.",
        "choices": {"A": "stable", "B": "parlous", "C": "secure", "D": "manageable"},
        "answer": "B",
        "explanation": "Running out of supplies and communication while a storm closes in is a parlous state — full of danger."
    },
    {
        "number": 94, "word": "compunction",
        "sentence": "She felt no ________ about resigning without notice after discovering the company had deliberately misled investors for years.",
        "choices": {"A": "compunction", "B": "pride", "C": "satisfaction", "D": "indifference"},
        "answer": "A",
        "explanation": "Feeling no guilt or moral scruple about an action is feeling no compunction. Note the negative phrasing here."
    },
    {
        "number": 95, "word": "tenebrous",
        "sentence": "The explorers descended into a ________ cavern where no sunlight had penetrated in centuries, their torches barely holding back the absolute dark.",
        "choices": {"A": "luminous", "B": "tenebrous", "C": "radiant", "D": "brilliant"},
        "answer": "B",
        "explanation": "A cavern of absolute darkness where sunlight never reaches is tenebrous — dark and gloomy."
    },
    {
        "number": 96, "word": "crepuscular",
        "sentence": "Deer are ________ animals, most active at dawn and dusk when the light is low enough to conceal them yet bright enough to spot predators.",
        "choices": {"A": "nocturnal", "B": "diurnal", "C": "crepuscular", "D": "hibernating"},
        "answer": "C",
        "explanation": "Active at dawn and dusk — the twilight hours — is the precise definition of crepuscular."
    },
    {
        "number": 97, "word": "pugnacious",
        "sentence": "The ________ columnist welcomed every reader complaint as an opportunity for another argument, responding to each letter with increased ferocity.",
        "choices": {"A": "peaceful", "B": "pugnacious", "C": "amicable", "D": "placid"},
        "answer": "B",
        "explanation": "Welcoming every complaint as a chance for argument with increasing ferocity is pugnacious — combative by disposition."
    },
    {
        "number": 98, "word": "sagacious",
        "sentence": "The ________ investor had anticipated the market correction six months before it happened, quietly repositioning her portfolio while others dismissed the warning signs.",
        "choices": {"A": "naive", "B": "reckless", "C": "sagacious", "D": "impulsive"},
        "answer": "C",
        "explanation": "Anticipating problems others miss through keen judgment is sagacious — having keen mental discernment and good judgment."
    },
    {
        "number": 99, "word": "vociferous",
        "sentence": "The ________ protesters outside the courthouse made it impossible to conduct the press conference, drowning out every speaker with chants and horn blasts.",
        "choices": {"A": "silent", "B": "vociferous", "C": "subdued", "D": "quiet"},
        "answer": "B",
        "explanation": "Protesters drowning out speakers with loud, forceful chanting are vociferous — loudly and vehemently expressive."
    },
    {
        "number": 100, "word": "ineffable",
        "sentence": "Survivors of the disaster struggled to describe what they had witnessed; some called the experience ________, beyond the reach of language.",
        "choices": {"A": "describable", "B": "ineffable", "C": "ordinary", "D": "mundane"},
        "answer": "B",
        "explanation": "An experience beyond the reach of language is ineffable — too great or extreme to be expressed in words."
    },
]

# ---------------------------------------------------------------------------
# WORDS IN CONTEXT DATA
# ---------------------------------------------------------------------------

WORDS_IN_CONTEXT = [
    {
        "section": 1,
        "passage_title": "Passage 1 — The Professor's Paradox",
        "passage": (
            "Professor Aldridge was known for two apparently contradictory qualities. Her lecture notes "
            "were brutally concise — bullet points, no wasted words — yet when she spoke, she was among "
            "the most eloquent voices in the department. Former students recalled that she could illuminate "
            "a theorem in three sentences on paper and then spend an inspired twenty minutes unpacking those "
            "same three sentences aloud, drawing connections that left the room in stunned silence."
        ),
        "questions": [
            {
                "number": "WIC-1", "stem": "As used in the passage, 'concise' most nearly means:",
                "choices": {"A": "incomplete and rushed", "B": "brief yet information-dense",
                            "C": "overly simplified", "D": "hastily written"},
                "answer": "B",
                "explanation": "'Concise' here means brief and information-dense (bullet points, no wasted words), not incomplete or simplified."
            },
            {
                "number": "WIC-2", "stem": "The word 'eloquent' as used in the passage primarily suggests that Professor Aldridge:",
                "choices": {"A": "spoke loudly and confidently", "B": "relied on technical vocabulary",
                            "C": "expressed ideas with grace and persuasive power", "D": "spoke at excessive length"},
                "answer": "C",
                "explanation": "Eloquence here is shown by her ability to leave listeners in stunned silence — grace and persuasive power."
            },
        ],
    },
    {
        "section": 1,
        "passage_title": "Passage 2 — Optimism and Evidence",
        "passage": (
            "Two scientists reviewed identical data from the clinical trial. Dr. Okafor was sanguine about "
            "the results, believing they pointed toward a breakthrough treatment. Dr. Levi was skeptical, "
            "noting that the sample size was small and that two of the most promising results came from "
            "patients who had also changed their diet during the trial. Their disagreement was not a failure "
            "of science but its engine: progress requires both the optimist who sees possibility and the "
            "doubter who demands proof."
        ),
        "questions": [
            {
                "number": "WIC-3", "stem": "In context, 'sanguine' most nearly means:",
                "choices": {"A": "cautious and methodical", "B": "confidently optimistic",
                            "C": "recklessly enthusiastic", "D": "professionally detached"},
                "answer": "B",
                "explanation": "Dr. Okafor believes the results point toward a breakthrough — a confident, optimistic reading."
            },
            {
                "number": "WIC-4", "stem": "The passage suggests Dr. Levi's 'skeptical' response was:",
                "choices": {"A": "an obstacle to scientific progress", "B": "a sign of inadequate preparation",
                            "C": "a valuable check on premature conclusions", "D": "motivated by personal rivalry"},
                "answer": "C",
                "explanation": "The passage explicitly calls their disagreement the 'engine' of progress — skepticism is a necessary check."
            },
        ],
    },
    {
        "section": 2,
        "passage_title": "Passage 3 — Two Kinds of Deception",
        "passage": (
            "Financial regulators have identified two distinct deceptive strategies. The first is obfuscation: "
            "hiding true figures behind layers of jargon, footnotes, and complex accounting structures so that "
            "even trained analysts struggle to understand the actual financial position. The second is the use "
            "of specious reasoning: arguments that appear logical and well-supported but that, on careful "
            "inspection, rest on faulty premises or cherry-picked data. Obfuscation operates through "
            "complexity; specious argument operates through apparent plausibility."
        ),
        "questions": [
            {
                "number": "WIC-5", "stem": "As used in the passage, 'obfuscation' involves making information:",
                "choices": {"A": "deliberately false", "B": "intentionally unclear through complexity",
                            "C": "temporarily unavailable", "D": "detailed but accurate"},
                "answer": "B",
                "explanation": "Obfuscation is defined in the passage as hiding figures behind jargon and complexity — intentionally unclear."
            },
            {
                "number": "WIC-6", "stem": "The word 'specious' in the passage most nearly means:",
                "choices": {"A": "highly technical", "B": "excessively optimistic",
                            "C": "superficially convincing but actually flawed", "D": "based on incomplete data"},
                "answer": "C",
                "explanation": "The passage describes specious reasoning as appearing logical but resting on faulty premises — superficially convincing but actually wrong."
            },
        ],
    },
    {
        "section": 2,
        "passage_title": "Passage 4 — The Peace Negotiators",
        "passage": (
            "History remembers the negotiators of the 1648 Peace of Westphalia as statesmen of rare ability. "
            "Where many leaders had been intransigent — clinging to maximalist demands long after the human "
            "cost of the war had become catastrophic — the Westphalian negotiators chose a different path. "
            "They were magnanimous in a way that confounded their contemporaries: willing to grant former "
            "enemies terms that allowed dignity in defeat, calculating that a stable peace required the "
            "losers to feel they had not been humiliated."
        ),
        "questions": [
            {
                "number": "WIC-7", "stem": "As used in the passage, 'intransigent' leaders were those who:",
                "choices": {"A": "sought peace at any price", "B": "refused to adjust demands regardless of consequences",
                            "C": "lacked the authority to make concessions", "D": "secretly negotiated separate terms"},
                "answer": "B",
                "explanation": "Intransigent leaders clung to maximalist demands even as the human cost became catastrophic — refusing to change position."
            },
            {
                "number": "WIC-8", "stem": "The 'magnanimous' approach of the Westphalian negotiators is best described as:",
                "choices": {"A": "granting excessive reparations to victors", "B": "imposing harsh terms to prevent future aggression",
                            "C": "offering generous terms to enable a stable, dignified peace", "D": "prolonging negotiations to maximize advantage"},
                "answer": "C",
                "explanation": "Magnanimous means generously granting terms that gave losers dignity, calculated to produce lasting stability."
            },
        ],
    },
    {
        "section": 3,
        "passage_title": "Passage 5 — The Fading Mural",
        "passage": (
            "The muralist had spent three years on the work, and yet she described her creation as "
            "intentionally evanescent. Applied directly to a crumbling exterior wall, the colors would "
            "fade and peel within a decade. She saw no contradiction between the labor of creation and "
            "the certainty of decay; for her, the ephemeral nature of the work was its central statement — "
            "that beauty, precisely because it cannot last, demands our full attention while it remains."
        ),
        "questions": [
            {
                "number": "WIC-9", "stem": "The word 'evanescent' as used in the passage most nearly means:",
                "choices": {"A": "brilliantly colored", "B": "gradually fading into nothing",
                            "C": "deeply symbolic", "D": "structurally fragile"},
                "answer": "B",
                "explanation": "The mural is described as fading and peeling over time — a gradual vanishing, which is evanescence."
            },
            {
                "number": "WIC-10", "stem": "In context, 'ephemeral' primarily describes:",
                "choices": {"A": "the artist's technique", "B": "the audience's reaction",
                            "C": "the brief duration of the mural's existence", "D": "the fragile materials used"},
                "answer": "C",
                "explanation": "The ephemeral nature refers to the mural not lasting — its brief existence is the work's central statement."
            },
        ],
    },
    {
        "section": 3,
        "passage_title": "Passage 6 — The Diagnostician",
        "passage": (
            "Dr. Vasquez had a reputation in the hospital that bordered on legend. Where other physicians "
            "worked through standard checklists, she noticed the details others missed: an asymmetric pupil "
            "dilating a fraction too slowly, a patient's posture suggesting guarded abdominal pain rather "
            "than musculoskeletal discomfort. Her perspicacious diagnoses had saved lives precisely because "
            "she refused to accept the obvious explanation when a subtler truth was available. She was also "
            "unusually lucid in her explanations, ensuring patients understood not just their diagnosis but "
            "the reasoning behind it."
        ),
        "questions": [
            {
                "number": "WIC-11", "stem": "As used in the passage, 'perspicacious' most nearly means:",
                "choices": {"A": "methodically thorough", "B": "highly experienced",
                            "C": "keenly perceptive and insightful", "D": "unusually cautious"},
                "answer": "C",
                "explanation": "Noticing subtle details others miss and refusing to accept obvious explanations describes perspicacity — keen perception."
            },
            {
                "number": "WIC-12", "stem": "The word 'lucid' as used in the passage primarily means:",
                "choices": {"A": "technically precise", "B": "empathetic and kind",
                            "C": "clear and easy to understand", "D": "unusually brief"},
                "answer": "C",
                "explanation": "Ensuring patients understood both diagnosis and reasoning describes lucid communication — clear and easy to understand."
            },
        ],
    },
    {
        "section": 3,
        "passage_title": "Passage 7 — The Defense Attorney",
        "passage": (
            "Public defenders learn early that circumlocution is a luxury they cannot afford. Jurors who "
            "follow a rambling argument lose the thread; a judge who must parse obscure phrasing grows "
            "impatient. The most effective public defenders speak with the pellucid directness of someone "
            "who has stripped every unnecessary word from their argument, leaving only what is essential. "
            "The sentence that cannot be misunderstood is the sentence most likely to be believed."
        ),
        "questions": [
            {
                "number": "WIC-13", "stem": "As used in the passage, 'circumlocution' is presented as:",
                "choices": {"A": "a persuasive rhetorical device", "B": "an inefficient, roundabout way of speaking",
                            "C": "a sign of legal expertise", "D": "a technique for managing difficult jurors"},
                "answer": "B",
                "explanation": "The passage contrasts circumlocution with the direct, stripped-down speech effective defenders use — it is inefficient and roundabout."
            },
            {
                "number": "WIC-14", "stem": "The word 'pellucid' as used here most nearly means:",
                "choices": {"A": "aggressive and forceful", "B": "emotionally compelling",
                            "C": "crystal clear and easily understood", "D": "formally structured"},
                "answer": "C",
                "explanation": "Pellucid directness — stripping every unnecessary word and leaving only the essential — means crystal clear."
            },
        ],
    },
    {
        "section": 4,
        "passage_title": "Passage 8 — The Indefatigable Activist",
        "passage": (
            "Maya Chen had been fighting for clean water access in rural communities for over two decades. "
            "What struck observers most was not the scale of her victories — though these were considerable — "
            "but her indefatigable commitment across stretches of failure and setback. During years when "
            "legislation stalled and funding dried up, she continued organizing, speaking, and filing suits. "
            "The lassitude that eventually overtook her colleagues seemed constitutionally impossible for "
            "her; she appeared to draw energy from the obstacles themselves."
        ),
        "questions": [
            {
                "number": "WIC-15", "stem": "As used in the passage, 'indefatigable' most nearly means:",
                "choices": {"A": "unusually optimistic", "B": "persistently tireless despite setbacks",
                            "C": "strategically patient", "D": "emotionally resilient"},
                "answer": "B",
                "explanation": "Continuing across years of failure without slowing is indefatigable — persisting tirelessly."
            },
            {
                "number": "WIC-16", "stem": "The word 'lassitude' as used in the passage refers to:",
                "choices": {"A": "a loss of strategic direction", "B": "physical illness",
                            "C": "deep fatigue and lack of energy", "D": "growing cynicism about outcomes"},
                "answer": "C",
                "explanation": "The lassitude that overtook colleagues is contrasted with Chen's energy — it is deep fatigue and lack of energy."
            },
        ],
    },
    {
        "section": 4,
        "passage_title": "Passage 9 — The Concert",
        "passage": (
            "The musician struggled afterward to explain what had happened on stage that night. The usual "
            "words — 'transcendent,' 'moving,' 'unforgettable' — felt inadequate, even insulting. What she "
            "had experienced was ineffable, she finally said; the harder she reached for language, the more "
            "the experience retreated from description. The audience, it turned out, felt the same way. "
            "Reviews the next morning were vociferous in their praise but oddly imprecise, as though every "
            "critic had agreed that this was extraordinary without being able to say exactly why."
        ),
        "questions": [
            {
                "number": "WIC-17", "stem": "As used in the passage, 'ineffable' most nearly means:",
                "choices": {"A": "deeply personal and private", "B": "too intense to remember clearly",
                            "C": "impossible to forget", "D": "beyond the ability of language to capture"},
                "answer": "D",
                "explanation": "The harder she reached for language the more it retreated — the experience was ineffable, beyond language."
            },
            {
                "number": "WIC-18", "stem": "The word 'vociferous' as used in the passage most nearly means:",
                "choices": {"A": "uniform and collective", "B": "loud and forcefully expressed",
                            "C": "carefully considered", "D": "unexpectedly enthusiastic"},
                "answer": "B",
                "explanation": "Vociferous praise from critics means loud and forcefully expressed admiration."
            },
        ],
    },
    {
        "section": 4,
        "passage_title": "Passage 10 — The Partisan Documentary",
        "passage": (
            "The film had been marketed as an objective account of the city council's controversial rezoning "
            "decision, but viewers quickly recognized it as tendentious. Every interview subject was a "
            "critic of the plan; every piece of footage emphasized disorder and opposition. The director's "
            "sagacious choice of music — dissonant strings under scenes of construction, warm strings under "
            "community gatherings — guided the viewer's emotional response without a single word of "
            "editorial commentary. The message was unmistakable even while remaining technically unspoken."
        ),
        "questions": [
            {
                "number": "WIC-19", "stem": "As used in the passage, 'tendentious' most nearly means:",
                "choices": {"A": "poorly researched", "B": "emotionally manipulative",
                            "C": "biased toward a particular viewpoint", "D": "factually inaccurate"},
                "answer": "C",
                "explanation": "Every choice in the film promotes one side of the debate — the film is tendentious: biased toward a particular cause."
            },
            {
                "number": "WIC-20", "stem": "The word 'sagacious' as used in the passage primarily means:",
                "choices": {"A": "controversial and risky", "B": "technically accomplished",
                            "C": "showing keen discernment and strategic intelligence", "D": "deliberately deceptive"},
                "answer": "C",
                "explanation": "Choosing music to guide emotional response without a word of commentary shows sagacious — keenly discerning — craft."
            },
        ],
    },
]

# ---------------------------------------------------------------------------
# MATCHING EXERCISES
# ---------------------------------------------------------------------------

MATCHING_EXERCISES = [
    {
        "section": 1,
        "title": "Section 1 — Matching Review",
        "words": ["pragmatic", "ambiguous", "meticulous", "prodigal", "eloquent",
                  "candid", "diligent", "tenacious", "skeptical", "lucid"],
        "definitions": [
            "A. Clear and easy to understand",
            "B. Fluent and persuasive in speech or writing",
            "C. Wastefully extravagant with money or resources",
            "D. Not easily convinced; having doubts",
            "E. Truthful and straightforward; frank",
            "F. Sensible and realistic; practical",
            "G. Showing great care and attention to detail",
            "H. Conscientious and careful in one's work",
            "I. Open to more than one interpretation",
            "J. Holding firmly to a purpose; persistent",
        ],
        "answers": {
            "pragmatic": "F", "ambiguous": "I", "meticulous": "G", "prodigal": "C",
            "eloquent": "B", "candid": "E", "diligent": "H", "tenacious": "J",
            "skeptical": "D", "lucid": "A",
        },
    },
    {
        "section": 2,
        "title": "Section 2 — Matching Review",
        "words": ["recalcitrant", "evanescent", "sanguine", "austere", "equivocal",
                  "ephemeral", "acrimony", "laconic", "poignant", "fortuitous"],
        "definitions": [
            "A. Happening by lucky chance; fortunate",
            "B. Optimistic, especially in a difficult situation",
            "C. Bitterness or ill feeling in speech or manner",
            "D. Brief and concise; using very few words",
            "E. Lasting for a very short time; transitory",
            "F. Deliberately ambiguous; open to multiple interpretations",
            "G. Soon passing out of sight or existence; quickly fading",
            "H. Evoking a keen sense of sadness or regret",
            "I. Obstinately uncooperative toward authority",
            "J. Severe or strict; lacking comfort or luxury",
        ],
        "answers": {
            "recalcitrant": "I", "evanescent": "G", "sanguine": "B", "austere": "J",
            "equivocal": "F", "ephemeral": "E", "acrimony": "C", "laconic": "D",
            "poignant": "H", "fortuitous": "A",
        },
    },
    {
        "section": 3,
        "title": "Section 3 — Matching Review",
        "words": ["obfuscate", "perspicacious", "circumlocution", "inveterate", "sophistry",
                  "mendacious", "magnanimous", "specious", "indefatigable", "pellucid"],
        "definitions": [
            "A. Translucently clear; easily understood",
            "B. The use of many words where fewer would do",
            "C. Clever but false argument designed to deceive",
            "D. Superficially plausible but actually wrong or misleading",
            "E. Having a firmly established, long-standing habit",
            "F. Keenly perceptive and discerning; shrewd",
            "G. Persisting tirelessly; never showing signs of fatigue",
            "H. Not telling the truth; habitually dishonest",
            "I. Very generous or forgiving toward a rival",
            "J. To make obscure or unintelligible deliberately",
        ],
        "answers": {
            "obfuscate": "J", "perspicacious": "F", "circumlocution": "B", "inveterate": "E",
            "sophistry": "C", "mendacious": "H", "magnanimous": "I", "specious": "D",
            "indefatigable": "G", "pellucid": "A",
        },
    },
    {
        "section": 4,
        "title": "Section 4 — Matching Review",
        "words": ["insouciance", "obdurate", "tendentious", "internecine", "nugatory",
                  "sempiternal", "lassitude", "minatory", "sagacious", "ineffable"],
        "definitions": [
            "A. Too great or extreme to be expressed in words",
            "B. Eternal and unchanging; everlasting",
            "C. Casual lack of concern; indifference",
            "D. Physical or mental weariness; lack of energy",
            "E. Stubbornly refusing to change opinion or course",
            "F. Promoting a particular point of view; biased",
            "G. Having keen mental discernment and good judgment",
            "H. Destructive to both sides in a conflict",
            "I. Of no value or importance; useless",
            "J. Expressing or conveying a threat; menacing",
        ],
        "answers": {
            "insouciance": "C", "obdurate": "E", "tendentious": "F", "internecine": "H",
            "nugatory": "I", "sempiternal": "B", "lassitude": "D", "minatory": "J",
            "sagacious": "G", "ineffable": "A",
        },
    },
]

# ---------------------------------------------------------------------------
# STYLE BUILDER
# ---------------------------------------------------------------------------

def build_styles():
    base = getSampleStyleSheet()
    s = {}

    def ps(name, **kw):
        return ParagraphStyle(name, parent=base["Normal"], **kw)

    s["cover_title"]    = ps("cover_title",    fontName=FONT_BOLD, fontSize=38,
                              textColor=colors.white, alignment=1, leading=46)
    s["cover_subtitle"] = ps("cover_subtitle", fontName=FONT_BODY, fontSize=16,
                              textColor=colors.white, alignment=1, leading=22)
    s["cover_body"]     = ps("cover_body",     fontName=FONT_BODY, fontSize=12,
                              textColor=DARK_GRAY, leading=18)
    s["cover_tier"]     = ps("cover_tier",     fontName=FONT_BOLD, fontSize=13,
                              textColor=DEEP_BLUE, leading=20)

    s["h1"]         = ps("h1",         fontName=FONT_BOLD, fontSize=18,
                          textColor=DEEP_BLUE, spaceBefore=14, spaceAfter=6)
    s["h2"]         = ps("h2",         fontName=FONT_BOLD, fontSize=14,
                          textColor=DEEP_BLUE, spaceBefore=10, spaceAfter=4)
    s["body"]       = ps("body",       fontName=FONT_BODY, fontSize=11,
                          textColor=DARK_GRAY, leading=17, spaceAfter=4)
    s["body_bold"]  = ps("body_bold",  fontName=FONT_BOLD, fontSize=11,
                          textColor=DARK_GRAY, leading=17)
    s["italic"]     = ps("italic",     fontName=FONT_ITAL, fontSize=10,
                          textColor=MID_GRAY, leading=15)

    s["q_num"]      = ps("q_num",      fontName=FONT_BOLD, fontSize=12,
                          textColor=AMBER, spaceBefore=8, spaceAfter=2)
    s["q_body"]     = ps("q_body",     fontName=FONT_BODY, fontSize=12,
                          textColor=DARK_GRAY, leading=18, spaceAfter=3)
    s["choice"]     = ps("choice",     fontName=FONT_BODY, fontSize=11,
                          textColor=DARK_GRAY, leading=16, leftIndent=18)

    s["passage_title"] = ps("passage_title", fontName=FONT_BOLD, fontSize=12,
                             textColor=DEEP_BLUE, spaceAfter=4)
    s["passage"]    = ps("passage",    fontName=FONT_ITAL, fontSize=11,
                          textColor=DARK_GRAY, leading=17)

    s["table_hdr"]  = ps("table_hdr",  fontName=FONT_BOLD, fontSize=11,
                          textColor=colors.white)
    s["word_entry"] = ps("word_entry", fontName=FONT_BOLD, fontSize=11,
                          textColor=DEEP_BLUE)
    s["pos_entry"]  = ps("pos_entry",  fontName=FONT_ITAL, fontSize=10,
                          textColor=MID_GRAY)
    s["def_entry"]  = ps("def_entry",  fontName=FONT_BODY, fontSize=10,
                          textColor=DARK_GRAY, leading=14)

    s["match_word"] = ps("match_word", fontName=FONT_BOLD, fontSize=11,
                          textColor=DARK_GRAY, leading=16)
    s["match_def"]  = ps("match_def",  fontName=FONT_BODY, fontSize=11,
                          textColor=DARK_GRAY, leading=16)
    s["match_ans"]  = ps("match_ans",  fontName=FONT_BODY, fontSize=11,
                          textColor=MID_GRAY)

    s["ak_q"]       = ps("ak_q",       fontName=FONT_BOLD, fontSize=10,
                          textColor=DARK_GRAY)
    s["ak_ans"]     = ps("ak_ans",     fontName=FONT_BOLD, fontSize=10,
                          textColor=DEEP_BLUE)
    s["ak_exp"]     = ps("ak_exp",     fontName=FONT_BODY, fontSize=9,
                          textColor=DARK_GRAY, leading=13)

    s["instruction"] = ps("instruction", fontName=FONT_ITAL, fontSize=10,
                           textColor=MID_GRAY, spaceAfter=6)
    s["footer"]      = ps("footer",      fontName=FONT_BODY, fontSize=9,
                           textColor=MID_GRAY, alignment=1)

    return s

# ---------------------------------------------------------------------------
# COVER PAGE
# ---------------------------------------------------------------------------

def cover_canvas(c, doc):
    W, H = letter
    # Top deep-blue band
    c.setFillColor(DEEP_BLUE)
    c.rect(0, H * 0.52, W, H * 0.48, fill=1, stroke=0)
    # Amber separator bar
    c.setFillColor(AMBER)
    c.rect(0, H * 0.52, W, 6, fill=1, stroke=0)
    # Bottom accent strip at page bottom
    c.setFillColor(AMBER)
    c.rect(0, 0, W, 4, fill=1, stroke=0)
    # Decorative amber rectangles
    c.setFillColor(AMBER)
    c.rect(0.5 * inch, 0.25 * inch, 1.0 * inch, 0.18 * inch, fill=1, stroke=0)
    c.setFillColor(DEEP_BLUE)
    c.rect(1.65 * inch, 0.25 * inch, 0.5 * inch, 0.18 * inch, fill=1, stroke=0)


def build_cover_page(styles):
    story = []
    story.append(Spacer(1, 1.6 * inch))

    # Title (sits in blue band — styled white via canvas)
    story.append(Paragraph("SAT Vocabulary Master", styles["cover_title"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("100 Essential Words &bull; 4 Difficulty Tiers", styles["cover_subtitle"]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph("Sentence Completion &bull; Words in Context &bull; Matching Exercises",
                            styles["cover_subtitle"]))
    story.append(Spacer(1, 2.1 * inch))   # moves past the amber bar into white area

    # Tier overview box
    tier_data = [
        [Paragraph("<b>Tier 1 — Foundation</b>", styles["cover_tier"]),
         Paragraph("Words 1–25 &nbsp;&nbsp;|&nbsp;&nbsp; Core academic vocabulary", styles["body"])],
        [Paragraph("<b>Tier 2 — Intermediate</b>", styles["cover_tier"]),
         Paragraph("Words 26–50 &nbsp;&nbsp;|&nbsp;&nbsp; Regular SAT-level challenge", styles["body"])],
        [Paragraph("<b>Tier 3 — Advanced</b>", styles["cover_tier"]),
         Paragraph("Words 51–75 &nbsp;&nbsp;|&nbsp;&nbsp; Upper-score differentiators", styles["body"])],
        [Paragraph("<b>Tier 4 — Expert</b>", styles["cover_tier"]),
         Paragraph("Words 76–100 &nbsp;&nbsp;|&nbsp;&nbsp; Highest-difficulty vocabulary", styles["body"])],
    ]
    tier_table = Table(tier_data, colWidths=[2.3 * inch, 4.7 * inch])
    tier_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_BLUE, colors.white, LIGHT_BLUE, colors.white]),
        ("BOX", (0, 0), (-1, -1), 1.5, DEEP_BLUE),
        ("LINEAFTER", (0, 0), (0, -1), 1, DEEP_BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(tier_table)
    story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph(
        "Complete Answer Key with Explanations &bull; Student-Friendly Format &bull; SAT Test Prep",
        styles["italic"]))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------------------
# HOW TO USE PAGE
# ---------------------------------------------------------------------------

def build_how_to_use_page(styles):
    story = []
    story.append(Paragraph("How to Use This Book", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=2, color=AMBER, spaceAfter=10))

    story.append(Paragraph(
        "This workbook contains <b>100 SAT vocabulary words</b> organized into four progressive "
        "difficulty tiers. Each section provides three types of exercises to build both recognition "
        "and contextual understanding — the two skills tested on the SAT.",
        styles["body"]))
    story.append(Spacer(1, 0.1 * inch))

    exercises = [
        ("<b>1. Sentence Completion</b>",
         "Each question presents a sentence with a blank. Choose the word (A–D) that best completes "
         "the meaning of the sentence. Read the entire sentence before choosing — look for contrast "
         "words (however, yet, although) and support words (likewise, therefore, as a result) that "
         "signal whether the blank needs a word with a similar or opposite meaning to other context clues."),
        ("<b>2. Words in Context</b>",
         "A short academic passage is followed by two questions asking what a specific word means "
         "as it is used in that passage. The correct answer fits the passage's meaning — not just a "
         "dictionary definition. Reread the sentence containing the word and substitute each answer "
         "choice to test which one preserves the meaning best."),
        ("<b>3. Matching Exercise</b>",
         "Ten words from the section are listed on the left. Ten definitions are listed on the right "
         "in scrambled order. Write the letter of the matching definition next to each word. This "
         "exercise builds rapid-recall vocabulary knowledge — an essential SAT skill."),
    ]
    for title, desc in exercises:
        story.append(Paragraph(title, styles["body_bold"]))
        story.append(Paragraph(desc, styles["body"]))
        story.append(Spacer(1, 0.08 * inch))

    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("Study Tips", styles["h2"]))
    tips = [
        "Work through one section per study session, spending 30–45 minutes.",
        "Complete the exercises before checking the Answer Key at the back.",
        "For each wrong answer, read the explanation carefully and write a new sentence using the word.",
        "Use the Vocabulary Reference Table at the start of each section as a study guide.",
        "Return to difficult words three days later for spaced-repetition review.",
    ]
    for tip in tips:
        story.append(Paragraph(f"&bull; &nbsp; {tip}", styles["body"]))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------------------
# SECTION HEADER
# ---------------------------------------------------------------------------

def build_section_header(section_num, tier_name, tier_desc, styles):
    data = [[
        Paragraph(f"SECTION {section_num}", styles["table_hdr"]),
        Paragraph(f"{tier_name} &nbsp;&mdash;&nbsp; {tier_desc}", styles["table_hdr"]),
    ]]
    t = Table(data, colWidths=[1.6 * inch, 5.4 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DEEP_BLUE),
        ("LINEBELOW", (0, 0), (-1, -1), 4, AMBER),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (0, 0), 12),
        ("LEFTPADDING", (1, 0), (1, 0), 8),
        ("FONTSIZE", (0, 0), (-1, -1), 14),
    ]))
    return [t, Spacer(1, 0.15 * inch)]

# ---------------------------------------------------------------------------
# VOCABULARY REFERENCE TABLE
# ---------------------------------------------------------------------------

def build_vocabulary_reference(words, styles):
    story = []
    story.append(Paragraph("Vocabulary Reference", styles["h2"]))
    story.append(Paragraph(
        "Study these definitions before attempting the exercises.", styles["instruction"]))

    header = [
        Paragraph("Word", styles["table_hdr"]),
        Paragraph("Part of Speech", styles["table_hdr"]),
        Paragraph("Definition", styles["table_hdr"]),
    ]
    rows = [header]
    for i, w in enumerate(words):
        bg = LIGHT_BLUE if i % 2 == 0 else colors.white
        rows.append([
            Paragraph(w["word"], styles["word_entry"]),
            Paragraph(w["pos"],  styles["pos_entry"]),
            Paragraph(w["definition"], styles["def_entry"]),
        ])

    col_widths = [1.45 * inch, 1.05 * inch, 4.5 * inch]
    t = Table(rows, colWidths=col_widths, repeatRows=1)

    row_colors = []
    for i in range(1, len(rows)):
        bg = LIGHT_BLUE if (i - 1) % 2 == 0 else colors.white
        row_colors.append(("BACKGROUND", (0, i), (-1, i), bg))

    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DEEP_BLUE),
        ("BOX", (0, 0), (-1, -1), 0.5, DEEP_BLUE),
        ("LINEBELOW", (0, 0), (-1, 0), 1, AMBER),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, MID_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ] + row_colors))

    story.append(t)
    story.append(Spacer(1, 0.25 * inch))
    return story

# ---------------------------------------------------------------------------
# SENTENCE COMPLETION BLOCK
# ---------------------------------------------------------------------------

def build_sentence_completion_block(questions, styles):
    story = []
    story.append(Paragraph("Part A — Sentence Completion", styles["h2"]))
    story.append(Paragraph(
        "Directions: Choose the word (A–D) that best completes the sentence.",
        styles["instruction"]))

    for q in questions:
        sentence_text = q["sentence"].replace("________", "<u>________</u>")
        elements = [
            Paragraph(f"<b>{q['number']}.</b>  {sentence_text}", styles["q_body"]),
        ]
        for letter in ("A", "B", "C", "D"):
            elements.append(
                Paragraph(f"({letter})&nbsp;&nbsp;{q['choices'][letter]}", styles["choice"])
            )
        elements.append(Spacer(1, 0.05 * inch))
        story.append(KeepTogether(elements))

    story.append(Spacer(1, 0.1 * inch))
    return story

# ---------------------------------------------------------------------------
# WORDS IN CONTEXT BLOCK
# ---------------------------------------------------------------------------

def build_words_in_context_block(passages, styles):
    story = []
    story.append(Paragraph("Part B — Words in Context", styles["h2"]))
    story.append(Paragraph(
        "Directions: Read each passage, then answer the questions that follow.",
        styles["instruction"]))

    for p in passages:
        passage_para = Paragraph(p["passage"], styles["passage"])
        box = Table([[passage_para]], colWidths=[7.0 * inch])
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
            ("BOX", (0, 0), (-1, -1), 1, DEEP_BLUE),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))

        block = [
            Paragraph(p["passage_title"], styles["passage_title"]),
            box,
            Spacer(1, 0.1 * inch),
        ]
        for wq in p["questions"]:
            block.append(Paragraph(f"<b>{wq['number']}.</b>  {wq['stem']}", styles["q_body"]))
            for letter in ("A", "B", "C", "D"):
                block.append(Paragraph(f"({letter})&nbsp;&nbsp;{wq['choices'][letter]}", styles["choice"]))
            block.append(Spacer(1, 0.05 * inch))
        block.append(Spacer(1, 0.1 * inch))
        story.append(KeepTogether(block))

    return story

# ---------------------------------------------------------------------------
# MATCHING BLOCK
# ---------------------------------------------------------------------------

def build_matching_block(exercise, styles):
    story = []
    story.append(Paragraph("Part C — Matching", styles["h2"]))
    story.append(Paragraph(
        "Directions: Write the letter of the matching definition (A–J) next to each word.",
        styles["instruction"]))

    left_col  = [[Paragraph(f"{i+1}.&nbsp;&nbsp;{w}", styles["match_word"])]
                 for i, w in enumerate(exercise["words"])]
    right_col = [[Paragraph(d, styles["match_def"])]
                 for d in exercise["definitions"]]

    rows = []
    for i in range(10):
        answer_box = Paragraph("______", styles["match_ans"])
        rows.append([left_col[i][0], answer_box, right_col[i][0]])

    t = Table(rows, colWidths=[2.1 * inch, 0.55 * inch, 4.35 * inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, PALE_GRAY]),
        ("BOX", (0, 0), (-1, -1), 0.5, MID_GRAY),
        ("LINEAFTER", (0, 0), (1, -1), 0.5, MID_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15 * inch))
    return story

# ---------------------------------------------------------------------------
# ANSWER KEY
# ---------------------------------------------------------------------------

def build_answer_key(styles):
    story = []
    story.append(PageBreak())
    story.append(Paragraph("Answer Key", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=2, color=AMBER, spaceAfter=8))
    story.append(Paragraph(
        "Full explanations are provided for all Sentence Completion and Words in Context questions. "
        "Review each explanation carefully — understanding why an answer is correct is as important as "
        "knowing the answer itself.",
        styles["body"]))
    story.append(Spacer(1, 0.15 * inch))

    sections_meta = [
        (1, "Tier 1 — Foundation",    TIER1_WORDS,  0,  25),
        (2, "Tier 2 — Intermediate",  TIER2_WORDS,  25, 50),
        (3, "Tier 3 — Advanced",      TIER3_WORDS,  50, 75),
        (4, "Tier 4 — Expert",        TIER4_WORDS,  75, 100),
    ]

    all_wic = {}
    for p in WORDS_IN_CONTEXT:
        for wq in p["questions"]:
            all_wic[wq["number"]] = wq

    for sec_num, sec_name, _, q_start, q_end in sections_meta:
        # Section sub-header
        hdr_data = [[Paragraph(f"Section {sec_num} — {sec_name}", styles["table_hdr"])]]
        hdr_t = Table(hdr_data, colWidths=[7.0 * inch])
        hdr_t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), DEEP_BLUE),
            ("LINEBELOW", (0, 0), (-1, -1), 3, AMBER),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(hdr_t)
        story.append(Spacer(1, 0.1 * inch))

        # Sentence completion answers — 2 columns
        story.append(Paragraph("<b>Part A — Sentence Completion</b>", styles["body_bold"]))
        story.append(Spacer(1, 0.05 * inch))

        sc_qs = SENTENCE_COMPLETION[q_start:q_end]
        # Group into pairs for two-column layout
        ak_rows = []
        for i in range(0, len(sc_qs), 2):
            row = []
            for q in sc_qs[i:i+2]:
                cell_content = [
                    Paragraph(f"<b>Q{q['number']}.</b>  Answer: <font color='#1565C0'><b>{q['answer']}</b></font>",
                               styles["ak_q"]),
                    Paragraph(q["explanation"], styles["ak_exp"]),
                ]
                row.append(cell_content)
            if len(row) == 1:
                row.append([Paragraph("", styles["ak_q"]), Paragraph("", styles["ak_exp"])])
            ak_rows.append(row)

        # Flatten cells for Table
        flat_rows = []
        for row in ak_rows:
            # Each cell is a list of paragraphs — put them in a sub-Table cell
            flat_rows.append([
                [row[0][0], row[0][1]],
                [row[1][0], row[1][1]],
            ])

        for pair in flat_rows:
            inner_data = [[pair[0][0], pair[1][0]],
                          [pair[0][1], pair[1][1]]]
            inner_t = Table(inner_data, colWidths=[3.5 * inch, 3.5 * inch])
            inner_t.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, 1), (-1, 1), 0.25, PALE_GRAY),
            ]))
            story.append(inner_t)

        story.append(Spacer(1, 0.12 * inch))

        # WIC answers
        story.append(Paragraph("<b>Part B — Words in Context</b>", styles["body_bold"]))
        story.append(Spacer(1, 0.05 * inch))
        wic_nums_for_section = {
            1: ["WIC-1", "WIC-2", "WIC-3", "WIC-4"],
            2: ["WIC-5", "WIC-6", "WIC-7", "WIC-8"],
            3: ["WIC-9", "WIC-10", "WIC-11", "WIC-12", "WIC-13", "WIC-14"],
            4: ["WIC-15", "WIC-16", "WIC-17", "WIC-18", "WIC-19", "WIC-20"],
        }
        for wnum in wic_nums_for_section[sec_num]:
            wq = all_wic[wnum]
            block = [
                Paragraph(f"<b>{wnum}.</b>  Answer: <font color='#1565C0'><b>{wq['answer']}</b></font>",
                           styles["ak_q"]),
                Paragraph(wq["explanation"], styles["ak_exp"]),
                Spacer(1, 0.04 * inch),
            ]
            story.append(KeepTogether(block))

        story.append(Spacer(1, 0.1 * inch))

        # Matching answers
        story.append(Paragraph("<b>Part C — Matching</b>", styles["body_bold"]))
        story.append(Spacer(1, 0.04 * inch))
        match_ex = MATCHING_EXERCISES[sec_num - 1]
        ans_items = [f"<b>{w}:</b> {match_ex['answers'][w]}" for w in match_ex["words"]]
        # Two rows of 5
        for chunk in [ans_items[:5], ans_items[5:]]:
            row_data = [[Paragraph(item, styles["ak_q"]) for item in chunk]]
            row_t = Table(row_data, colWidths=[1.4 * inch] * 5)
            row_t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_AMBER),
                ("BOX", (0, 0), (-1, -1), 0.5, AMBER),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, AMBER),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]))
            story.append(row_t)
            story.append(Spacer(1, 0.04 * inch))

        story.append(Spacer(1, 0.2 * inch))

    # Back note
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER, spaceAfter=8))
    story.append(Paragraph(
        "Keep reviewing words you missed. Spaced repetition — revisiting difficult words after 1 day, "
        "3 days, and 1 week — is the most effective method for long-term vocabulary retention.",
        styles["italic"]))
    return story

# ---------------------------------------------------------------------------
# PAGE NUMBERING CALLBACK
# ---------------------------------------------------------------------------

def add_page_number(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont(FONT_BODY, 9)
    canvas_obj.setFillColor(MID_GRAY)
    canvas_obj.drawCentredString(
        letter[0] / 2, 0.4 * inch,
        f"SAT Vocabulary Master  —  Page {doc.page}"
    )
    # Thin top rule (skip cover = page 1)
    if doc.page > 1:
        canvas_obj.setStrokeColor(DEEP_BLUE)
        canvas_obj.setLineWidth(1.5)
        canvas_obj.line(0.75 * inch, letter[1] - 0.55 * inch,
                        letter[0] - 0.75 * inch, letter[1] - 0.55 * inch)
    canvas_obj.restoreState()


def first_page(canvas_obj, doc):
    cover_canvas(canvas_obj, doc)
    add_page_number(canvas_obj, doc)


def later_pages(canvas_obj, doc):
    add_page_number(canvas_obj, doc)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    output_path = "SAT_exercises.pdf"
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.7 * inch,
        title="SAT Vocabulary Master",
        author="SAT Prep",
    )

    styles = build_styles()
    story = []

    # Cover + How to Use
    story += build_cover_page(styles)
    story += build_how_to_use_page(styles)

    sections_config = [
        (1, "Tier 1", "Foundation (Words 1–25)",      TIER1_WORDS,  0,  25),
        (2, "Tier 2", "Intermediate (Words 26–50)",   TIER2_WORDS,  25, 50),
        (3, "Tier 3", "Advanced (Words 51–75)",       TIER3_WORDS,  50, 75),
        (4, "Tier 4", "Expert (Words 76–100)",        TIER4_WORDS,  75, 100),
    ]

    for sec_num, tier_name, tier_desc, words, q_start, q_end in sections_config:
        story += build_section_header(sec_num, tier_name, tier_desc, styles)
        story += build_vocabulary_reference(words, styles)
        story += build_sentence_completion_block(
            SENTENCE_COMPLETION[q_start:q_end], styles)

        sec_passages = [p for p in WORDS_IN_CONTEXT if p["section"] == sec_num]
        story += build_words_in_context_block(sec_passages, styles)
        story += build_matching_block(MATCHING_EXERCISES[sec_num - 1], styles)
        story.append(PageBreak())

    story += build_answer_key(styles)

    doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)
    print(f"Generated: {output_path}")


if __name__ == "__main__":
    main()
