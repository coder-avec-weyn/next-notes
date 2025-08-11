import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 1536;

// Helper function to convert markdown to HTML
const markdownToHtml = (text: string): string => {
  return (
    text
      // Headers
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")

      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")

      // Lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.+<\/li>\n)+/g, "<ul>$&</ul>")
      .replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>\d+\..+<\/li>\n)+/g, "<ol>$&</ol>")

      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")

      // Blockquotes
      .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")

      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

      // Line breaks
      .replace(/\n{3,}/g, "<br><br>") // Reduce excessive line breaks
      .replace(/\n/g, "<br>") // Convert remaining line breaks

      .trim()
  );
};

// Helper function to clean AI response and convert to HTML
const cleanAIResponse = (text: string): string => {
  // First check if the response already contains HTML tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(text);

  if (hasHtmlTags) {
    // If it already has HTML, just clean up excessive whitespace
    return text
      .replace(/\n{3,}/g, "\n\n") // Reduce excessive line breaks
      .replace(/\s+\n/g, "\n") // Remove spaces before line breaks
      .replace(/\n\s+/g, "\n") // Remove spaces after line breaks
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
      .trim();
  } else {
    // If it's markdown or plain text, convert to HTML
    return markdownToHtml(text);
  }
};

// Helper function to split long responses
const splitLongResponse = (text: string, maxLength: number = 800): string[] => {
  if (text.length <= maxLength) return [text];

  // Split by sentences, being careful not to break code blocks
  const sentences: string[] = [];
  let inCodeBlock = false;
  let currentSentence = "";

  // First, handle code blocks and sentences
  const chars = text.split("");
  for (let i = 0; i < chars.length; i++) {
    currentSentence += chars[i];

    // Check for code block markers
    if (
      i >= 2 &&
      chars[i - 2] === "`" &&
      chars[i - 1] === "`" &&
      chars[i] === "`"
    ) {
      inCodeBlock = !inCodeBlock;
    }

    // Only split sentences when not in a code block
    if (
      !inCodeBlock &&
      (chars[i] === "." || chars[i] === "!" || chars[i] === "?")
    ) {
      // Look ahead to see if this is really the end of a sentence
      if (
        i === chars.length - 1 ||
        chars[i + 1] === " " ||
        chars[i + 1] === "\n"
      ) {
        sentences.push(currentSentence.trim());
        currentSentence = "";
      }
    }
  }

  // Add any remaining text
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  // Now build chunks from sentences
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    // If adding this sentence would exceed maxLength
    if ((currentChunk + " " + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }

    // If a single sentence is longer than maxLength
    if (sentence.length > maxLength && currentChunk === sentence) {
      // Try to find a good breaking point
      const breakPoints = ["\n\n", "\n", ". ", "! ", "? ", ", ", " "];

      for (const breakPoint of breakPoints) {
        if (sentence.includes(breakPoint)) {
          const parts = sentence.split(breakPoint);
          let part = "";

          for (let i = 0; i < parts.length; i++) {
            if (
              (part + (i > 0 ? breakPoint : "") + parts[i]).length >
                maxLength &&
              part
            ) {
              chunks.push(part.trim());
              part = parts[i];
            } else {
              part += (i > 0 ? breakPoint : "") + parts[i];
            }
          }

          if (part) {
            currentChunk = part;
          }

          break;
        }
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.filter((chunk) => chunk.length > 0);
};

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const { prompt, type = "chatbot" } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // Truncate prompt if too long instead of rejecting
    const truncatedPrompt =
      prompt.length > MAX_CHARS
        ? prompt.substring(0, MAX_CHARS - 50) + "... [truncated]"
        : prompt;

    // Adjust temperature and other settings based on request type
    let temperature = 0.7;
    let maxOutputTokens = MAX_OUTPUT_TOKENS;
    let systemPrompt = "";

    if (type === "poetry_assistant") {
      // More creative for poetry assistance
      temperature = 0.8;
      maxOutputTokens = 1536;
      systemPrompt = "You are a master poet and poetry assistant. Help with creative writing, formatting, style improvements, and poetic techniques. Be inspiring and maintain the artistic essence of poetry.";
    } else if (type === "writing_assistant") {
      // More precise for writing assistance
      temperature = 0.4;
      maxOutputTokens = 1536;
    } else if (type === "chatbot") {
      // Conversational and helpful
      temperature = 0.8;
      maxOutputTokens = 1024;
    }

    // Prepare the request to Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt ? `${systemPrompt}\n\n${truncatedPrompt}` : truncatedPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from Gemini" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Extract the response text from Gemini API
    const rawResponseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean the response
    const cleanedResponse = cleanAIResponse(rawResponseText);

    // Split long responses into chunks
    const responseChunks = splitLongResponse(cleanedResponse);

    return NextResponse.json({
      response:
        responseChunks.length === 1 ? responseChunks[0] : responseChunks[0],
      hasMore: responseChunks.length > 1,
      chunks: responseChunks.length > 1 ? responseChunks : undefined,
    });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}