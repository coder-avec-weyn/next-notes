export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRandomColor(): string {
  const colors = [
    "#f87171", // red
    "#fb923c", // orange
    "#fbbf24", // amber
    "#a3e635", // lime
    "#4ade80", // green
    "#2dd4bf", // teal
    "#38bdf8", // sky
    "#818cf8", // indigo
    "#c084fc", // purple
    "#f472b6", // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
];

export const moodOptions = [
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "focused", label: "Focused" },
  { value: "tired", label: "Tired" },
  { value: "stressed", label: "Stressed" },
  { value: "inspired", label: "Inspired" },
];

export const weatherOptions = [
  { value: "sunny", label: "Sunny" },
  { value: "cloudy", label: "Cloudy" },
  { value: "rainy", label: "Rainy" },
  { value: "snowy", label: "Snowy" },
  { value: "stormy", label: "Stormy" },
  { value: "foggy", label: "Foggy" },
];

export function encodedRedirect(type: string, path: string, message: string) {
  const params = new URLSearchParams();
  params.set("type", type);
  params.set("message", message);
  return `${path}?${params.toString()}`;
}
