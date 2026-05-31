import fs from "fs";
import path from "path";

let cached: string | null = null;

export function loadKnowledgeBase(): string {
  if (cached) return cached;

  const kbDir = path.join(process.cwd(), "kb");
  const files = fs
    .readdirSync(kbDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const parts = files.map((file) => {
    const body = fs.readFileSync(path.join(kbDir, file), "utf-8");
    return `## SOURCE: ${file}\n\n${body.trim()}`;
  });

  cached = parts.join("\n\n---\n\n");
  return cached;
}
