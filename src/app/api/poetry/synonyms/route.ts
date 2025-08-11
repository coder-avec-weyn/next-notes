import { NextRequest, NextResponse } from "next/server";

// Simple synonym dictionary for common words
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  "beautiful": ["lovely", "gorgeous", "stunning", "elegant", "graceful", "exquisite", "magnificent", "radiant"],
  "love": ["adore", "cherish", "treasure", "devotion", "affection", "passion", "romance", "fondness"],
  "happy": ["joyful", "cheerful", "delighted", "elated", "blissful", "content", "merry", "gleeful"],
  "sad": ["melancholy", "sorrowful", "mournful", "dejected", "despondent", "gloomy", "downcast", "heartbroken"],
  "angry": ["furious", "enraged", "livid", "irate", "wrathful", "incensed", "indignant", "resentful"],
  "big": ["large", "huge", "enormous", "massive", "gigantic", "immense", "colossal", "vast"],
  "small": ["tiny", "little", "minute", "petite", "miniature", "compact", "diminutive", "minuscule"],
  "good": ["excellent", "wonderful", "marvelous", "superb", "outstanding", "exceptional", "splendid", "magnificent"],
  "bad": ["terrible", "awful", "dreadful", "horrible", "atrocious", "deplorable", "wretched", "abysmal"],
  "fast": ["quick", "rapid", "swift", "speedy", "hasty", "brisk", "fleet", "expeditious"],
  "slow": ["sluggish", "leisurely", "gradual", "unhurried", "deliberate", "languid", "tardy", "dawdling"],
  "bright": ["brilliant", "radiant", "luminous", "gleaming", "shining", "dazzling", "vivid", "glowing"],
  "dark": ["dim", "shadowy", "murky", "gloomy", "obscure", "somber", "dusky", "black"],
  "hot": ["warm", "scorching", "blazing", "burning", "sweltering", "torrid", "fiery", "heated"],
  "cold": ["chilly", "freezing", "frigid", "icy", "frosty", "arctic", "bitter", "cool"],
  "strong": ["powerful", "mighty", "robust", "sturdy", "vigorous", "potent", "forceful", "resilient"],
  "weak": ["feeble", "frail", "fragile", "delicate", "vulnerable", "powerless", "faint", "brittle"],
  "old": ["ancient", "elderly", "aged", "mature", "vintage", "antique", "seasoned", "weathered"],
  "young": ["youthful", "juvenile", "fresh", "new", "tender", "immature", "budding", "green"],
  "new": ["fresh", "novel", "recent", "modern", "contemporary", "current", "latest", "innovative"],
  "walk": ["stroll", "wander", "amble", "saunter", "stride", "march", "pace", "trek"],
  "run": ["sprint", "dash", "race", "bolt", "flee", "rush", "hurry", "gallop"],
  "look": ["gaze", "stare", "glance", "peer", "observe", "watch", "examine", "behold"],
  "see": ["observe", "witness", "behold", "perceive", "notice", "spot", "glimpse", "view"],
  "hear": ["listen", "perceive", "detect", "catch", "overhear", "eavesdrop", "heed", "attend"],
  "say": ["speak", "utter", "declare", "state", "express", "voice", "articulate", "pronounce"],
  "think": ["ponder", "contemplate", "reflect", "consider", "muse", "deliberate", "meditate", "reason"],
  "know": ["understand", "comprehend", "realize", "recognize", "grasp", "perceive", "discern", "fathom"],
  "feel": ["sense", "experience", "perceive", "touch", "handle", "caress", "stroke", "grope"],
  "give": ["offer", "present", "provide", "grant", "bestow", "donate", "contribute", "deliver"],
  "take": ["grab", "seize", "capture", "obtain", "acquire", "receive", "accept", "collect"],
  "make": ["create", "produce", "construct", "build", "craft", "manufacture", "form", "fashion"],
  "break": ["shatter", "smash", "fracture", "crack", "split", "destroy", "ruin", "demolish"],
  "work": ["labor", "toil", "effort", "job", "task", "occupation", "employment", "profession"],
  "play": ["frolic", "gambol", "sport", "recreation", "amusement", "entertainment", "fun", "game"],
  "eat": ["consume", "devour", "feast", "dine", "nibble", "munch", "chew", "swallow"],
  "drink": ["sip", "gulp", "swallow", "imbibe", "consume", "quaff", "guzzle", "taste"],
  "sleep": ["slumber", "rest", "doze", "nap", "snooze", "repose", "drowse", "hibernate"],
  "wake": ["awaken", "rouse", "stir", "arise", "get up", "emerge", "revive", "alert"],
  "home": ["house", "dwelling", "residence", "abode", "domicile", "habitat", "shelter", "haven"],
  "water": ["liquid", "fluid", "stream", "river", "ocean", "sea", "lake", "pond"],
  "fire": ["flame", "blaze", "inferno", "conflagration", "combustion", "heat", "warmth", "glow"],
  "earth": ["ground", "soil", "land", "terrain", "world", "planet", "globe", "dirt"],
  "air": ["atmosphere", "breeze", "wind", "breath", "oxygen", "sky", "heavens", "space"],
  "light": ["illumination", "brightness", "radiance", "glow", "shine", "beam", "ray", "gleam"],
  "time": ["moment", "instant", "period", "duration", "era", "age", "epoch", "season"],
  "life": ["existence", "being", "vitality", "animation", "spirit", "soul", "essence", "breath"],
  "death": ["demise", "passing", "end", "expiration", "mortality", "doom", "fate", "destruction"],
  "heart": ["soul", "spirit", "core", "center", "essence", "feelings", "emotions", "love"],
  "mind": ["brain", "intellect", "consciousness", "thoughts", "psyche", "mentality", "cognition", "reason"],
  "body": ["form", "figure", "physique", "frame", "anatomy", "flesh", "corpse", "torso"],
  "hand": ["palm", "fist", "grasp", "grip", "touch", "fingers", "appendage", "limb"],
  "eye": ["gaze", "sight", "vision", "orb", "pupil", "iris", "glance", "stare"],
  "face": ["countenance", "visage", "features", "expression", "appearance", "look", "aspect", "mien"],
  "voice": ["sound", "tone", "speech", "utterance", "words", "expression", "articulation", "vocalization"],
  "word": ["term", "expression", "phrase", "utterance", "vocabulary", "language", "speech", "statement"],
  "song": ["melody", "tune", "ballad", "hymn", "chant", "verse", "music", "harmony"],
  "music": ["melody", "harmony", "rhythm", "tune", "sound", "composition", "symphony", "song"],
  "dance": ["movement", "rhythm", "ballet", "waltz", "performance", "choreography", "steps", "motion"],
  "art": ["creativity", "expression", "beauty", "craft", "skill", "masterpiece", "work", "creation"],
  "book": ["volume", "tome", "novel", "text", "manuscript", "publication", "work", "literature"],
  "story": ["tale", "narrative", "account", "fable", "legend", "myth", "chronicle", "saga"],
  "dream": ["vision", "fantasy", "aspiration", "hope", "wish", "desire", "imagination", "reverie"],
  "hope": ["wish", "desire", "aspiration", "expectation", "optimism", "faith", "trust", "confidence"],
  "fear": ["terror", "dread", "anxiety", "worry", "panic", "fright", "horror", "apprehension"],
  "pain": ["ache", "hurt", "suffering", "agony", "torment", "anguish", "distress", "discomfort"],
  "joy": ["happiness", "delight", "bliss", "elation", "euphoria", "ecstasy", "pleasure", "contentment"],
  "peace": ["tranquility", "serenity", "calm", "quiet", "stillness", "harmony", "rest", "silence"],
  "war": ["conflict", "battle", "fight", "combat", "struggle", "strife", "warfare", "hostility"],
  "truth": ["reality", "fact", "honesty", "sincerity", "authenticity", "veracity", "accuracy", "certainty"],
  "lie": ["falsehood", "deception", "untruth", "fabrication", "fiction", "dishonesty", "deceit", "fraud"],
  "freedom": ["liberty", "independence", "autonomy", "release", "emancipation", "deliverance", "escape", "sovereignty"],
  "power": ["strength", "force", "might", "energy", "authority", "control", "influence", "dominance"],
  "money": ["wealth", "riches", "fortune", "cash", "currency", "capital", "funds", "treasure"],
  "friend": ["companion", "ally", "buddy", "pal", "mate", "comrade", "confidant", "associate"],
  "enemy": ["foe", "adversary", "opponent", "rival", "antagonist", "nemesis", "competitor", "opposition"],
  "family": ["relatives", "kin", "clan", "tribe", "household", "lineage", "ancestry", "bloodline"],
  "child": ["kid", "youngster", "youth", "minor", "offspring", "baby", "infant", "toddler"],
  "mother": ["mom", "mama", "parent", "matriarch", "caregiver", "nurturer", "guardian", "protector"],
  "father": ["dad", "papa", "parent", "patriarch", "sire", "guardian", "protector", "provider"],
  "woman": ["lady", "female", "girl", "maiden", "dame", "matron", "miss", "ma'am"],
  "man": ["male", "gentleman", "guy", "fellow", "chap", "sir", "mister", "gent"],
  "king": ["monarch", "ruler", "sovereign", "emperor", "majesty", "crown", "throne", "royalty"],
  "queen": ["monarch", "ruler", "sovereign", "empress", "majesty", "crown", "throne", "royalty"],
  "god": ["deity", "divine", "almighty", "creator", "supreme", "heavenly", "sacred", "holy"],
  "angel": ["seraph", "cherub", "messenger", "spirit", "guardian", "heavenly", "divine", "celestial"],
  "devil": ["demon", "satan", "evil", "fiend", "monster", "beast", "villain", "darkness"],
  "heaven": ["paradise", "bliss", "eternity", "afterlife", "nirvana", "utopia", "eden", "glory"],
  "hell": ["inferno", "damnation", "torment", "abyss", "underworld", "purgatory", "suffering", "darkness"],
  "star": ["celestial", "heavenly", "cosmic", "stellar", "bright", "shining", "twinkling", "luminous"],
  "sun": ["solar", "daylight", "sunshine", "radiance", "warmth", "light", "brightness", "golden"],
  "moon": ["lunar", "crescent", "silver", "night", "celestial", "orb", "satellite", "glow"],
  "sky": ["heavens", "firmament", "atmosphere", "space", "cosmos", "azure", "blue", "expanse"],
  "cloud": ["mist", "vapor", "fog", "haze", "cumulus", "nimbus", "overcast", "shadow"],
  "rain": ["precipitation", "shower", "drizzle", "downpour", "storm", "drops", "water", "wet"],
  "snow": ["frost", "ice", "flakes", "winter", "white", "cold", "crystal", "powder"],
  "wind": ["breeze", "gust", "gale", "draft", "air", "current", "zephyr", "tempest"],
  "storm": ["tempest", "hurricane", "tornado", "cyclone", "gale", "squall", "blizzard", "thunder"],
  "mountain": ["peak", "summit", "hill", "ridge", "cliff", "slope", "elevation", "height"],
  "valley": ["dale", "glen", "hollow", "basin", "depression", "gorge", "ravine", "canyon"],
  "river": ["stream", "brook", "creek", "flow", "current", "waterway", "tributary", "channel"],
  "ocean": ["sea", "deep", "waves", "tide", "marine", "aquatic", "blue", "vast"],
  "forest": ["woods", "trees", "woodland", "jungle", "grove", "thicket", "wilderness", "timber"],
  "tree": ["oak", "pine", "maple", "birch", "cedar", "willow", "elm", "branch"],
  "flower": ["blossom", "bloom", "petal", "rose", "lily", "daisy", "tulip", "orchid"],
  "grass": ["lawn", "meadow", "field", "pasture", "turf", "green", "blade", "sod"],
  "bird": ["fowl", "avian", "feathered", "winged", "flight", "song", "nest", "chirp"],
  "fish": ["aquatic", "marine", "swimming", "scales", "fins", "gills", "water", "ocean"],
  "animal": ["creature", "beast", "wildlife", "fauna", "mammal", "species", "living", "wild"],
  "dog": ["canine", "hound", "puppy", "mutt", "pet", "companion", "loyal", "faithful"],
  "cat": ["feline", "kitten", "pet", "purr", "whiskers", "paws", "independent", "graceful"],
  "horse": ["steed", "mare", "stallion", "colt", "equine", "gallop", "mane", "noble"],
  "color": ["hue", "shade", "tint", "tone", "pigment", "dye", "paint", "spectrum"],
  "red": ["crimson", "scarlet", "ruby", "cherry", "rose", "blood", "fire", "passion"],
  "blue": ["azure", "navy", "cobalt", "sapphire", "sky", "ocean", "royal", "deep"],
  "green": ["emerald", "jade", "forest", "lime", "mint", "olive", "verdant", "nature"],
  "yellow": ["golden", "amber", "lemon", "sunshine", "bright", "cheerful", "warm", "light"],
  "black": ["dark", "ebony", "midnight", "coal", "shadow", "void", "night", "deep"],
  "white": ["pure", "snow", "ivory", "pearl", "clean", "bright", "light", "pristine"],
  "purple": ["violet", "lavender", "plum", "royal", "majestic", "regal", "rich", "deep"],
  "orange": ["amber", "peach", "tangerine", "sunset", "warm", "bright", "vibrant", "citrus"],
  "pink": ["rose", "blush", "coral", "salmon", "soft", "gentle", "feminine", "delicate"],
  "brown": ["tan", "chocolate", "coffee", "earth", "wood", "rustic", "warm", "natural"],
  "gray": ["silver", "ash", "slate", "steel", "neutral", "cloudy", "dull", "muted"],
  "gold": ["golden", "precious", "valuable", "treasure", "wealth", "shine", "gleam", "rich"],
  "silver": ["metallic", "shiny", "bright", "precious", "moon", "gleaming", "lustrous", "polished"]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word")?.toLowerCase();

    if (!word) {
      return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
    }

    // Get synonyms from our dictionary
    const synonyms = SYNONYM_DICTIONARY[word] || [];
    
    // If no direct match, try to find partial matches or related words
    const additionalSynonyms: string[] = [];
    
    if (synonyms.length === 0) {
      // Look for words that contain the input word or vice versa
      Object.entries(SYNONYM_DICTIONARY).forEach(([key, values]) => {
        if (key.includes(word) || word.includes(key)) {
          additionalSynonyms.push(...values.slice(0, 3)); // Add first 3 synonyms
        }
        // Also check if any synonym contains our word
        values.forEach(synonym => {
          if (synonym.includes(word) || word.includes(synonym)) {
            additionalSynonyms.push(key, ...values.slice(0, 2));
          }
        });
      });
    }

    // Combine and deduplicate
    const allSynonyms = [...new Set([...synonyms, ...additionalSynonyms])];
    
    // Limit to reasonable number
    const limitedSynonyms = allSynonyms.slice(0, 10);

    return NextResponse.json({ data: limitedSynonyms });
  } catch (error) {
    console.error("Error in synonyms API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}