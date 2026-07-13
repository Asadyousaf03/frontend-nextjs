export function parseSseChunk(buffer: string): {
  events: string[];
  remainder: string;
} {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";
  const events = parts
    .filter((part) => part.startsWith("data: "))
    .map((part) => part.replace("data: ", ""));

  return { events, remainder };
}
