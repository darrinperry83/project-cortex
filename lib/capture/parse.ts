export interface CaptureResult {
  title: string;
  path?: string;
  tags: string[];
  props: Record<string, string>;
  due?: string; // ISO
  scheduled?: string; // ISO
}

export function parseCapture(input: string): CaptureResult {
  const out: CaptureResult = { title: "", tags: [], props: {} };
  let s = input.trim();
  if (s.startsWith("t ")) s = s.slice(2);

  const pathMatch = s.match(/#([\w\s/:-]+)/);
  if (pathMatch) {
    out.path = "#" + pathMatch[1].trim();
    s = s.replace(pathMatch[0], "").trim();
  }

  const tagRe = /@([\w\-/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s))) out.tags.push(m[1]);
  s = s.replace(tagRe, "").trim();

  const propRe = /prop\.([\w-]+)=([^\s]+)/g;
  while ((m = propRe.exec(s))) out.props[m[1]] = m[2];
  s = s.replace(propRe, "").trim();

  const due = s.match(/due\s+([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i);
  if (due) {
    out.due = new Date(due[1] + "T09:00:00").toISOString();
    s = s.replace(due[0], "").trim();
  }

  const at = s.match(/\b(at|@)\s+([0-9]{1,2}:[0-9]{2})\b/i);
  if (at) {
    const [h, mi] = at[2].split(":").map(Number);
    const d = new Date();
    d.setHours(h, mi, 0, 0);
    out.scheduled = d.toISOString();
    s = s.replace(at[0], "").trim();
  }

  out.title = s.trim();
  return out;
}
