"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";
import { isReady, score } from "@/lib/scoring";
import { useLiveQuery } from "dexie-react-hooks";

export default function AgendaPage() {
  const [rows, setRows] = useState<{ id: string; title: string; ready: boolean; score: number }[]>(
    []
  );
  const todos = useLiveQuery(() => db.blocks.filter((b) => b.type === "todo").toArray(), []) ?? [];

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  async function refresh() {
    const withScores = await Promise.all(
      todos.map(async (t) => ({
        id: t.id,
        title: t.title ?? "",
        ready: await isReady(t.id),
        score: await score(t.id),
      }))
    );
    setRows(withScores.sort((a, b) => b.score - a.score));
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Agenda</h2>
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
                  <span className="text-green-500">Ready</span>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="p-2">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
