import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Analyze the poetry content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const stanzas = content.split(/\n\s*\n/).filter(stanza => stanza.trim().length > 0);

    // Basic poetry form detection
    let poetryForm = "free_verse";
    let rhymeScheme = "";
    
    // Detect common forms
    if (lines.length === 14) {
      poetryForm = "sonnet";
      rhymeScheme = "ABAB CDCD EFEF GG"; // Shakespearean sonnet pattern
    } else if (lines.length === 3 && stanzas.length === 1) {
      // Check if it might be a haiku (5-7-5 syllable pattern)
      const syllableCounts = lines.map(line => estimateSyllables(line));
      if (syllableCounts[0] === 5 && syllableCounts[1] === 7 && syllableCounts[2] === 5) {
        poetryForm = "haiku";
        rhymeScheme = "none";
      }
    } else if (lines.length === 5 && stanzas.length === 1) {
      poetryForm = "limerick";
      rhymeScheme = "AABBA";
    } else if (stanzas.length >= 2) {
      // Check for ballad meter (alternating 8-6-8-6 syllables)
      const firstStanzaLines = stanzas[0].split('\n').filter(line => line.trim().length > 0);
      if (firstStanzaLines.length === 4) {
        const syllables = firstStanzaLines.map(line => estimateSyllables(line));
        if (syllables[0] >= 7 && syllables[0] <= 9 && 
            syllables[1] >= 5 && syllables[1] <= 7 &&
            syllables[2] >= 7 && syllables[2] <= 9 && 
            syllables[3] >= 5 && syllables[3] <= 7) {
          poetryForm = "ballad";
          rhymeScheme = "ABAB";
        }
      }
    }

    // Detect rhyme scheme for shorter poems
    if (lines.length <= 8 && lines.length >= 2) {
      rhymeScheme = detectRhymeScheme(lines);
    }

    // Calculate additional metrics
    const wordCount = words.length;
    const lineCount = lines.length;
    const stanzaCount = stanzas.length;
    const averageWordsPerLine = Math.round(wordCount / lineCount);
    const averageSyllablesPerLine = Math.round(
      lines.reduce((sum, line) => sum + estimateSyllables(line), 0) / lineCount
    );

    // Detect mood based on word analysis
    const mood = detectMood(content.toLowerCase());

    // Detect themes
    const themes = detectThemes(content.toLowerCase());

    const analysis = {
      poetry_form: poetryForm,
      rhyme_scheme: rhymeScheme,
      word_count: wordCount,
      line_count: lineCount,
      stanza_count: stanzaCount,
      average_words_per_line: averageWordsPerLine,
      average_syllables_per_line: averageSyllablesPerLine,
      estimated_reading_time: Math.ceil(wordCount / 200),
      detected_mood: mood,
      detected_themes: themes,
      structure_analysis: {
        has_regular_meter: hasRegularMeter(lines),
        has_rhyme: rhymeScheme !== "" && rhymeScheme !== "none",
        is_structured: poetryForm !== "free_verse",
      }
    };

    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error("Error in poetry analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to estimate syllables in a word
function estimateSyllables(text: string): number {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  return words.reduce((total, word) => {
    // Remove punctuation
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cleanWord.length === 0) return total;
    
    // Count vowel groups
    const vowelGroups = cleanWord.match(/[aeiouy]+/g) || [];
    let syllables = vowelGroups.length;
    
    // Adjust for silent e
    if (cleanWord.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Minimum of 1 syllable per word
    return total + Math.max(1, syllables);
  }, 0);
}

// Helper function to detect rhyme scheme
function detectRhymeScheme(lines: string[]): string {
  if (lines.length < 2) return "";
  
  const endWords = lines.map(line => {
    const words = line.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
  });

  // Simple rhyme detection based on ending sounds
  const rhymeGroups: string[][] = [];
  const scheme: string[] = [];
  
  endWords.forEach((word, index) => {
    let foundGroup = false;
    
    for (let i = 0; i < rhymeGroups.length; i++) {
      if (rhymesWith(word, rhymeGroups[i][0])) {
        rhymeGroups[i].push(word);
        scheme[index] = String.fromCharCode(65 + i); // A, B, C, etc.
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      rhymeGroups.push([word]);
      scheme[index] = String.fromCharCode(65 + rhymeGroups.length - 1);
    }
  });

  return scheme.join('');
}

// Simple rhyme detection
function rhymesWith(word1: string, word2: string): boolean {
  if (word1 === word2) return true;
  
  // Check for common ending patterns
  const endings = [
    word1.slice(-2), word1.slice(-3), word1.slice(-1)
  ];
  
  return endings.some(ending => 
    ending.length > 1 && word2.endsWith(ending)
  );
}

// Detect mood based on keywords
function detectMood(content: string): string {
  const moodKeywords = {
    romantic: ['love', 'heart', 'kiss', 'embrace', 'passion', 'romance', 'beloved', 'darling', 'sweet', 'tender'],
    melancholic: ['sad', 'sorrow', 'tears', 'lonely', 'empty', 'lost', 'grief', 'mourn', 'weep', 'despair'],
    joyful: ['happy', 'joy', 'laugh', 'smile', 'bright', 'cheerful', 'delight', 'celebrate', 'dance', 'sing'],
    nature: ['tree', 'flower', 'river', 'mountain', 'forest', 'bird', 'sky', 'earth', 'wind', 'rain'],
    mystical: ['magic', 'mystery', 'dream', 'spirit', 'soul', 'ethereal', 'cosmic', 'divine', 'enchant', 'mystic'],
    contemplative: ['think', 'ponder', 'reflect', 'wonder', 'question', 'search', 'seek', 'understand', 'wisdom', 'truth']
  };

  let maxScore = 0;
  let detectedMood = 'contemplative';

  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood;
    }
  });

  return detectedMood;
}

// Detect themes
function detectThemes(content: string): string[] {
  const themeKeywords = {
    love: ['love', 'heart', 'romance', 'passion', 'kiss', 'embrace'],
    nature: ['tree', 'flower', 'river', 'mountain', 'forest', 'bird', 'sky'],
    time: ['time', 'moment', 'forever', 'eternal', 'past', 'future', 'memory'],
    death: ['death', 'die', 'grave', 'funeral', 'mourn', 'loss', 'end'],
    hope: ['hope', 'dream', 'wish', 'future', 'tomorrow', 'light', 'dawn'],
    freedom: ['free', 'freedom', 'liberty', 'escape', 'fly', 'soar', 'release'],
    beauty: ['beautiful', 'lovely', 'gorgeous', 'elegant', 'graceful', 'stunning'],
    pain: ['pain', 'hurt', 'ache', 'suffer', 'wound', 'scar', 'break'],
    journey: ['journey', 'travel', 'road', 'path', 'walk', 'destination', 'adventure'],
    home: ['home', 'house', 'family', 'mother', 'father', 'child', 'comfort']
  };

  const detectedThemes: string[] = [];

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1);
    }, 0);

    if (score > 0) {
      detectedThemes.push(theme);
    }
  });

  return detectedThemes.slice(0, 3); // Return top 3 themes
}

// Check if poem has regular meter
function hasRegularMeter(lines: string[]): boolean {
  if (lines.length < 3) return false;
  
  const syllableCounts = lines.map(line => estimateSyllables(line));
  const firstCount = syllableCounts[0];
  
  // Check if most lines have similar syllable counts (within 1-2 syllables)
  const similarLines = syllableCounts.filter(count => 
    Math.abs(count - firstCount) <= 2
  ).length;
  
  return similarLines / lines.length >= 0.7; // 70% of lines should be similar
}