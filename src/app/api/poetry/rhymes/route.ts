import { NextRequest, NextResponse } from "next/server";

// Simple rhyme dictionary for common words
const RHYME_DICTIONARY: Record<string, string[]> = {
  "love": ["dove", "above", "shove", "glove", "thereof"],
  "heart": ["art", "part", "start", "smart", "chart", "dart"],
  "night": ["light", "bright", "sight", "flight", "might", "right"],
  "day": ["way", "say", "play", "stay", "may", "ray"],
  "time": ["rhyme", "climb", "prime", "chime", "lime", "mime"],
  "dream": ["stream", "beam", "cream", "team", "gleam", "scheme"],
  "soul": ["goal", "whole", "role", "coal", "bowl", "toll"],
  "mind": ["find", "kind", "blind", "wind", "bind", "signed"],
  "life": ["wife", "knife", "strife", "rife"],
  "death": ["breath", "beneath", "wreath"],
  "pain": ["rain", "gain", "main", "chain", "plain", "strain"],
  "joy": ["boy", "toy", "employ", "destroy", "enjoy"],
  "fear": ["near", "dear", "clear", "tear", "year", "hear"],
  "hope": ["scope", "rope", "slope", "cope", "mope"],
  "peace": ["cease", "release", "increase", "lease", "piece"],
  "war": ["far", "star", "car", "bar", "scar", "jar"],
  "sun": ["run", "fun", "done", "one", "gun", "won"],
  "moon": ["soon", "tune", "June", "spoon", "noon", "croon"],
  "sea": ["free", "tree", "be", "key", "flee", "decree"],
  "sky": ["high", "fly", "try", "cry", "dry", "why"],
  "fire": ["desire", "inspire", "tire", "wire", "choir", "expire"],
  "water": ["daughter", "slaughter", "quarter", "shorter"],
  "wind": ["find", "kind", "blind", "mind", "bind", "signed"],
  "earth": ["birth", "worth", "mirth", "girth"],
  "flower": ["power", "hour", "tower", "shower", "bower"],
  "tree": ["free", "sea", "be", "key", "flee", "decree"],
  "bird": ["word", "heard", "third", "stirred", "blurred"],
  "song": ["long", "strong", "wrong", "along", "belong"],
  "dance": ["chance", "glance", "romance", "advance", "stance"],
  "smile": ["while", "style", "mile", "file", "pile", "aisle"],
  "tear": ["fear", "near", "dear", "clear", "year", "hear"],
  "kiss": ["miss", "bliss", "this", "dismiss", "abyss"],
  "hand": ["land", "stand", "band", "grand", "sand", "planned"],
  "eye": ["sky", "high", "fly", "try", "cry", "dry"],
  "face": ["place", "space", "grace", "race", "case", "trace"],
  "voice": ["choice", "rejoice", "noise"],
  "word": ["bird", "heard", "third", "stirred", "blurred"],
  "truth": ["youth", "booth", "proof", "roof"],
  "lie": ["sky", "high", "fly", "try", "cry", "dry"],
  "home": ["dome", "roam", "foam", "chrome", "tome"],
  "road": ["load", "code", "mode", "showed", "glowed"],
  "door": ["more", "floor", "shore", "core", "store", "pour"],
  "window": ["shadow", "meadow"],
  "light": ["night", "bright", "sight", "flight", "might", "right"],
  "dark": ["park", "mark", "bark", "spark", "arc", "shark"],
  "cold": ["old", "bold", "gold", "told", "hold", "fold"],
  "warm": ["storm", "form", "norm", "swarm", "charm"],
  "sweet": ["meet", "feet", "beat", "heat", "neat", "complete"],
  "bitter": ["litter", "glitter", "twitter", "fitter"],
  "soft": ["loft", "oft", "aloft"],
  "hard": ["card", "guard", "yard", "regard", "starred"],
  "fast": ["last", "past", "cast", "vast", "blast", "mast"],
  "slow": ["flow", "grow", "show", "know", "glow", "throw"],
  "big": ["fig", "dig", "pig", "wig", "twig", "rig"],
  "small": ["all", "call", "fall", "wall", "tall", "hall"],
  "new": ["few", "grew", "knew", "flew", "drew", "true"],
  "old": ["cold", "bold", "gold", "told", "hold", "fold"],
  "young": ["sung", "hung", "lung", "rung", "swung", "tongue"],
  "good": ["would", "could", "should", "stood", "wood", "hood"],
  "bad": ["sad", "mad", "had", "glad", "pad", "dad"],
  "happy": ["snappy", "sappy"],
  "sad": ["bad", "mad", "had", "glad", "pad", "dad"],
  "angry": ["hungry"],
  "calm": ["palm", "psalm", "balm"],
  "wild": ["child", "mild", "filed", "smiled", "styled"],
  "free": ["tree", "sea", "be", "key", "flee", "decree"],
  "bound": ["found", "sound", "ground", "round", "wound", "crowned"],
  "lost": ["cost", "frost", "crossed", "tossed", "bossed"],
  "found": ["bound", "sound", "ground", "round", "wound", "crowned"],
  "begin": ["win", "sin", "thin", "spin", "grin", "chin"],
  "end": ["bend", "send", "tend", "mend", "blend", "spend"],
  "start": ["heart", "art", "part", "smart", "chart", "dart"],
  "stop": ["top", "drop", "shop", "hop", "pop", "crop"],
  "go": ["flow", "grow", "show", "know", "glow", "throw"],
  "come": ["some", "from", "drum", "hum", "sum", "thumb"],
  "stay": ["day", "way", "say", "play", "may", "ray"],
  "leave": ["believe", "achieve", "receive", "deceive", "conceive"],
  "give": ["live", "forgive", "sieve"],
  "take": ["make", "wake", "break", "shake", "lake", "cake"],
  "make": ["take", "wake", "break", "shake", "lake", "cake"],
  "break": ["make", "take", "wake", "shake", "lake", "cake"],
  "build": ["filled", "skilled", "willed", "thrilled", "chilled"],
  "fall": ["all", "call", "small", "wall", "tall", "hall"],
  "rise": ["eyes", "skies", "wise", "prize", "size", "surprise"],
  "fly": ["sky", "high", "try", "cry", "dry", "why"],
  "walk": ["talk", "chalk", "stalk", "hawk", "balk"],
  "run": ["sun", "fun", "done", "one", "gun", "won"],
  "dance": ["chance", "glance", "romance", "advance", "stance"],
  "sing": ["ring", "bring", "spring", "wing", "thing", "king"],
  "laugh": ["half", "staff", "calf", "behalf"],
  "cry": ["sky", "high", "fly", "try", "dry", "why"],
  "sleep": ["deep", "keep", "weep", "steep", "leap", "cheap"],
  "wake": ["make", "take", "break", "shake", "lake", "cake"],
  "eat": ["meat", "beat", "heat", "neat", "seat", "treat"],
  "drink": ["think", "sink", "link", "pink", "wink", "brink"],
  "work": ["lurk", "smirk", "quirk", "clerk", "perk"],
  "play": ["day", "way", "say", "stay", "may", "ray"],
  "learn": ["turn", "burn", "earn", "stern", "yearn", "concern"],
  "teach": ["reach", "beach", "each", "preach", "breach", "peach"],
  "read": ["lead", "head", "bread", "dead", "red", "fed"],
  "write": ["night", "light", "bright", "sight", "flight", "might"],
  "speak": ["seek", "week", "creek", "peak", "leak", "cheek"],
  "listen": ["glisten", "christen"],
  "see": ["free", "tree", "be", "key", "flee", "decree"],
  "look": ["book", "took", "cook", "hook", "brook", "shook"],
  "watch": ["catch", "match", "patch", "batch", "latch", "scratch"],
  "feel": ["real", "deal", "heal", "meal", "seal", "steal"],
  "touch": ["much", "such", "clutch", "crutch", "hutch"],
  "hear": ["fear", "near", "dear", "clear", "year", "tear"],
  "smell": ["tell", "well", "bell", "sell", "fell", "spell"],
  "taste": ["waste", "haste", "paste", "faced", "placed", "traced"]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word")?.toLowerCase();

    if (!word) {
      return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
    }

    // Get rhymes from our dictionary
    const rhymes = RHYME_DICTIONARY[word] || [];
    
    // Add some basic rhyming logic for words not in dictionary
    const additionalRhymes: string[] = [];
    
    // Simple suffix-based rhyming
    if (word.endsWith("ing")) {
      const base = word.slice(0, -3);
      additionalRhymes.push(`${base}ing`, "ring", "sing", "bring", "thing");
    } else if (word.endsWith("ed")) {
      const base = word.slice(0, -2);
      additionalRhymes.push(`${base}ed`, "red", "said", "head", "bread");
    } else if (word.endsWith("ly")) {
      const base = word.slice(0, -2);
      additionalRhymes.push(`${base}ly`, "sky", "fly", "try", "why");
    } else if (word.endsWith("tion")) {
      additionalRhymes.push("nation", "station", "creation", "relation", "emotion");
    } else if (word.endsWith("ness")) {
      additionalRhymes.push("less", "mess", "stress", "bless", "dress");
    }

    // Combine and deduplicate
    const allRhymes = [...new Set([...rhymes, ...additionalRhymes])];
    
    // Format as RhymeSuggestion objects
    const suggestions = allRhymes.map(rhyme => ({
      word: rhyme,
      score: rhymes.includes(rhyme) ? 0.9 : 0.6, // Higher score for dictionary matches
      syllables: rhyme.split(/[aeiou]/gi).length - 1 || 1, // Rough syllable count
    }));

    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error("Error in rhymes API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}