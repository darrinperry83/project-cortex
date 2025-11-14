"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/state/store";

function isReady(blockId: string): boolean {
  const st = useStore.getState();
  const b = st.blocks[blockId];
  if (!b || b.type !== "todo") return false;
  const status = Object.values(st.props).find((p) => p.blockId === blockId && p.key === "status");
  if (status?.value.kind === "string" && status.value.s === "done") return false;
  const sched = Object.values(st.props).find(
    (p) => p.blockId === blockId && p.key === "scheduled_at"
  );
  if (sched?.value.kind === "datetime" && new Date(sched.value.t) > new Date()) return false;
  return true;
}

function score(blockId: string): number {
  const st = useStore.getState();
  const due = Object.values(st.props).find((p) => p.blockId === blockId && p.key === "due_at");
  let s = 0;
  if (due?.value.kind === "datetime") {
    const d = new Date(due.value.t).getTime() - Date.now();
    s += d < 0 ? 100 : d < 86400000 ? 80 : d < 3 * 86400000 ? 60 : 30;
  }
  if (isReady(blockId)) s += 10;
  return s;
}

export default function AgendaDemo() {
  const st = useStore();
  const todos = useMemo(
    () => Object.values(st.blocks).filter((b) => b.type === "todo"),
    [st.blocks]
  );
  const rows = useMemo(
    () =>
      todos
        .map((b) => ({ id: b.id, title: b.title ?? "", ready: isReady(b.id), score: score(b.id) }))
        .sort((a, b) => b.score - a.score),
    [todos]
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-400">Demo scoring: due urgency + ready bonus.</div>
      <table className="w-full text-sm border border-neutral-800">
        <thead className="bg-neutral-900">
          <tr>
            <th className="p-2 text-left">Task</th>
            <th className="p-2">Ready</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              <td className="p-2">{r.title}</td>
              <td className="p-2">
                {r.ready ? (
                  <span className="text-ok-500">Ready</span>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="p-2">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
