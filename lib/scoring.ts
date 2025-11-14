import { db } from "./db/dexie";

export async function isReady(id: string) {
  const status = await db.props.where({ blockId: id, key: "status" }).first();
  if (status?.s === "done") return false;
  const sched = await db.props.where({ blockId: id, key: "scheduled_at" }).first();
  if (sched?.t && new Date(sched.t) > new Date()) return false;
  return true;
}

export async function score(id: string) {
  let s = 0;
  const due = await db.props.where({ blockId: id, key: "due_at" }).first();
  if (due?.t) {
    const d = new Date(due.t).getTime() - Date.now();
    s += d < 0 ? 100 : d < 86400000 ? 80 : d < 3 * 86400000 ? 60 : 30;
  }
  if (await isReady(id)) s += 10;
  return s;
}
