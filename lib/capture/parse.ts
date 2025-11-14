// Very small parser for strings like:
// t Title #Path/Sub due Fri 4pm @tag1 @tag2 prop.key=value after "Other task"
export interface CaptureResult {
  title: string;
  path?: string;
  tags: string[];
  props: Record<string, string>;
  due?: string; // ISO (rough)
  scheduled?: string; // ISO (rough)
}

export function parseCapture(input: string): CaptureResult {
  const out: CaptureResult = { title: "", tags: [], props: {} };
  let s = input.trim();
  if (s.startsWith("t ")) s = s.slice(2);

  // path #A/B/C
  const pathMatch = s.match(/#([\w\s/:-]+)/);
  if (pathMatch) {
    out.path = "#" + pathMatch[1].trim();
    s = s.replace(pathMatch[0], "").trim();
  }
  // tags @tag
  const tagRe = /@([\w\-/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s))) out.tags.push(m[1]);
  s = s.replace(tagRe, "").trim();

  // props prop.key=value
  const propRe = /prop\.([\w-]+)=([^\s]+)/g;
  while ((m = propRe.exec(s))) out.props[m[1]] = m[2];
  s = s.replace(propRe, "").trim();

  // naive due parse "due YYYY-MM-DD" or YYYY/MM/DD
  const due = s.match(/due\s+([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i);
  if (due) {
    out.due = new Date(due[1].replace(/\//g, "-") + "T09:00:00").toISOString();
    s = s.replace(due[0], "").trim();
  }
  // naive scheduled parse "at HH:MM"
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
