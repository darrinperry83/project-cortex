export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Project Cortex</h1>
      <p className="text-neutral-300">
        A modern, intuitive, offline-capable system for projects, tasks, and knowledge.
      </p>
      <ul className="list-disc list-inside text-neutral-300 space-y-1">
        <li>
          <a href="/agenda">Agenda</a>
        </li>
        <li>
          <a href="/projects">Projects</a>
        </li>
        <li>
          <a href="/notes">Notes</a>
        </li>
        <li>
          <a href="/travel">Travel</a>
        </li>
        <li>
          <a href="/habits">Habits</a>
        </li>
      </ul>
      <p className="text-neutral-400">
        Open the command palette with <kbd>⌘/Ctrl</kbd> + <kbd>K</kbd>.
      </p>
    </div>
  );
}
