# Push 1 — Next.js PWA Shell (React/TS), UI Libraries, Command Palette (No Backend)

**Objective**  
Create a **modern application shell** with Next.js (App Router), Tailwind, Radix UI, cmdk (command palette), TanStack Query, and basic PWA setup. Ship navigable stub pages and a global top bar + command palette with keyboard shortcuts. **No server, API, or DB schema in this push.**

---

## Scope & Non‑Goals

**In scope**

- Next.js 14 (App Router) + TypeScript app at the **repo root**.
- Tailwind CSS + Radix UI primitives + cmdk (command palette).
- TanStack Query (client cache) & Devtools (wires only; no backend calls).
- PWA: `manifest.json`, service worker via **next‑pwa**, offline shell caching.
- Global **Topbar** and **Command Palette (⌘/Ctrl+K)** to navigate and run stub commands.
- Stub pages: `/agenda`, `/projects`, `/notes`, `/travel`, `/habits` with basic layout.
- ESLint, Prettier, Husky (pre‑commit), lint‑staged.
- Minimal theming and accessible components.

**Out of scope**

- No API routes beyond Next defaults.
- No database or sync. (All data placeholders/mocks.)

---

## Repository Changes (layout)

```
.
├─ app/
│  ├─ agenda/page.tsx
│  ├─ projects/page.tsx
│  ├─ notes/page.tsx
│  ├─ travel/page.tsx
│  ├─ habits/page.tsx
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ providers.tsx
├─ components/
│  ├─ Topbar.tsx
│  ├─ CommandPalette.tsx
│  └─ KeyboardShortcuts.tsx
├─ public/
│  ├─ manifest.json
│  └─ icons/
│     ├─ icon-192.png   # tiny placeholder PNGs (base64 provided below)
│     └─ icon-512.png
├─ styles/
│  └─ globals.css
├─ .eslintrc.cjs
├─ .eslintignore
├─ .prettierrc
├─ .prettierignore
├─ next.config.mjs
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ .nvmrc
├─ .editorconfig
└─ (added by Husky on install) .husky/pre-commit
```

> We are **not** creating a monorepo here—just a single `apps/web`‑style app at the repo root for simplicity.

---

## Node, Package Manager, and Scripts

- **Node**: `>=18.18.0` (LTS) — set in `.nvmrc`.
- **Package manager**: `pnpm` (recommended) or `npm`. Scripts assume `pnpm`; if you prefer `npm`, replace commands accordingly.

---

## File Contents (copy exactly)

### 1) `.nvmrc`

```
v18.18.0
```

### 2) `.editorconfig`

```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
```

### 3) `package.json`

```json
{
  "name": "cortex-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-query-devtools": "^5.51.0",
    "autoprefixer": "^10.4.20",
    "cmdk": "^0.2.1",
    "lucide-react": "^0.441.0",
    "next": "^14.2.5",
    "next-pwa": "^5.6.0",
    "postcss": "^8.4.47",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.13",
    "workbox-window": "^7.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "eslint-config-prettier": "^9.1.0",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.8",
    "prettier": "^3.3.3",
    "typescript": "^5.6.3"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": ["prettier --write"]
  }
}
```

### 4) `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["dom", "dom.iterable", "es2021"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "types": ["node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5) `.eslintrc.cjs`

```js
/* eslint-env node */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:react/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
```

### 6) `.eslintignore`

```
.next
node_modules
public
```

### 7) `.prettierrc`

```json
{
  "singleQuote": false,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 8) `.prettierignore`

```
.next
node_modules
public
```

### 9) `next.config.mjs` (Next + PWA)

```js
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV !== "production";

const withPWAPlugin = withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
});

export default withPWAPlugin({
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
});
```

### 10) `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 11) `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2E90FA",
          600: "#1B6FD8",
          700: "#1459AE",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 12) `styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0b0f14;
  --text: #e6eaf2;
}

html,
body {
  @apply h-full;
}

body {
  @apply bg-neutral-950 text-neutral-100 antialiased;
}

a {
  @apply text-brand underline-offset-4 hover:underline;
}
```

### 13) `public/manifest.json`

```json
{
  "name": "Project Cortex",
  "short_name": "Cortex",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0f14",
  "theme_color": "#2E90FA",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 14) `public/icons/icon-192.png` and `public/icons/icon-512.png`

> Create both files with this **base64** content (tiny placeholder 1×1 transparent PNG). The sizes in manifest are for browser compliance; real icons can be added later.

**Base64 (for both files):**

```
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO1Jp3sAAAAASUVORK5CYII=
```

### 15) `app/layout.tsx`

```tsx
import "./../styles/globals.css";
import { Providers } from "./providers";
import { Topbar } from "@/components/Topbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Cortex",
  description: "Modern, offline-capable project/task/knowledge OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Topbar />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

### 16) `app/providers.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { CommandPalette } from "@/components/CommandPalette";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      {children}
      <CommandPalette />
      <KeyboardShortcuts />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 17) `app/page.tsx` (Landing)

```tsx
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
```

### 18) Stub pages

`app/agenda/page.tsx`

```tsx
export default function AgendaPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Agenda</h2>
      <p className="text-neutral-300">Saved views and filters will appear here.</p>
    </section>
  );
}
```

`app/projects/page.tsx`

```tsx
export default function ProjectsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Projects</h2>
      <p className="text-neutral-300">Project list and focused headers will appear here.</p>
    </section>
  );
}
```

`app/notes/page.tsx`

```tsx
export default function NotesPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Notes</h2>
      <p className="text-neutral-300">Knowledge base and procedures will appear here.</p>
    </section>
  );
}
```

`app/travel/page.tsx`

```tsx
export default function TravelPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Travel</h2>
      <p className="text-neutral-300">Trips, cities, bookings, and places will appear here.</p>
    </section>
  );
}
```

`app/habits/page.tsx`

```tsx
export default function HabitsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Habits</h2>
      <p className="text-neutral-300">Daily slots and streaks will appear here.</p>
    </section>
  );
}
```

### 19) `components/Topbar.tsx`

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Command } from "lucide-react";

export function Topbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-4">
        <Link href="/" className="font-medium">
          Cortex
        </Link>
        <nav className="text-sm text-neutral-300 flex items-center gap-3">
          <Link href="/agenda">Agenda</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/habits">Habits</Link>
        </nav>
        <div className="ml-auto">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-2 py-1 text-sm hover:bg-neutral-800"
            aria-label="Open command palette"
          >
            <Command className="w-4 h-4" /> <span className="hidden sm:inline">Command</span>
            <span className="ml-2 text-neutral-400">⌘K</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 20) `components/CommandPalette.tsx` (cmdk)

```tsx
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const hotkey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (hotkey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="mx-auto mt-24 max-w-xl rounded-md bg-neutral-900 p-2 shadow-lg ring-1 ring-neutral-700">
        <CommandPrimitive>
          <CommandPrimitive.Input
            placeholder="Type a command or search…"
            autoFocus
            className="w-full bg-neutral-900 p-3 outline-none text-neutral-100 placeholder:text-neutral-400"
          />
          <CommandPrimitive.List className="max-h-80 overflow-auto p-1">
            <CommandPrimitive.Empty className="p-3 text-neutral-400">
              No results.
            </CommandPrimitive.Empty>
            <CommandPrimitive.Group heading="Navigate" className="text-neutral-400">
              <CommandPrimitive.Item onSelect={() => navigate("/agenda")}>
                Go to Agenda
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/projects")}>
                Go to Projects
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/notes")}>
                Go to Notes
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/travel")}>
                Go to Travel
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/habits")}>
                Go to Habits
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
            <CommandPrimitive.Separator />
            <CommandPrimitive.Group heading="Actions" className="text-neutral-400">
              <CommandPrimitive.Item onSelect={() => alert("Quick capture coming soon")}>
                Quick capture (coming soon)
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </div>
      <button className="fixed inset-0" aria-label="Close" onClick={() => setOpen(false)} />
    </div>
  );
}
```

### 21) `components/KeyboardShortcuts.tsx`

```tsx
"use client";

import { useEffect } from "react";

export function KeyboardShortcuts() {
  useEffect(() => {
    const preventFindOnSlash = (e: KeyboardEvent) => {
      // Example place to wire additional shortcuts later
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventFindOnSlash);
    return () => window.removeEventListener("keydown", preventFindOnSlash);
  }, []);
  return null;
}
```

### 22) Tailwind base types

`next-env.d.ts` will be auto-generated by Next on first run.

---

## Husky Setup

After dependencies install, run:

```bash
pnpm dlx husky-init --yarn2 && pnpm exec husky install
```

Replace `.husky/pre-commit` with:

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
pnpm typecheck
```

---

## Usage Instructions

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Run dev server**

   ```bash
   pnpm dev
   # open http://localhost:3000
   ```

3. **Check PWA**
   - Open DevTools → Application → Manifest (should show “Project Cortex”).
   - In dev, SW is **disabled** (by config). In production build it will be generated.

4. **Production build (to test PWA)**

   ```bash
   pnpm build && pnpm start
   # now check Application → Service Workers and go offline to confirm shell caching
   ```

5. **Keyboard**
   - Press ⌘/Ctrl + K to open the Command Palette.
   - Navigate to the stub pages from the palette.

---

## Acceptance Criteria (QA Checklist)

- [ ] `pnpm install` succeeds on Node 18.18+.
- [ ] `pnpm dev` serves the app at http://localhost:3000 without errors.
- [ ] Topbar appears with links to Agenda/Projects/Notes/Travel/Habits.
- [ ] Command palette opens with ⌘/Ctrl+K and navigates to each stub page.
- [ ] `pnpm build && pnpm start` produces a running app with a **manifest** and **service worker** (Workbox via next‑pwa).
- [ ] Lighthouse PWA audit: **Installable** (dev icons are placeholders).
- [ ] ESLint/Prettier/Husky work: committing triggers formatting and typecheck.

---

## Troubleshooting

- **TypeScript types missing**: Ensure `@types/react`, `@types/node`, `@types/react-dom` installed (they are). Reopen editor.
- **SW not active in dev**: By design (`disable: true` when NODE_ENV !== production). Build/start to test.
- **PWA icons**: Placeholder 1×1 PNGs are included; replace with real 192/512 icons later for proper install UI.
- **pnpm not installed**: `npm i -g pnpm` or use `npm install`/`npm run dev` (scripts work similarly).

---

## README Addition (suggested)

Append to `README.md`:

```md
## Push 1 — Next.js PWA Shell

- Install: `pnpm install`
- Dev: `pnpm dev` → http://localhost:3000
- Build: `pnpm build && pnpm start`
- PWA: Manifest included; SW generated in production via next-pwa.
- Command Palette: ⌘/Ctrl + K
- Pages: /agenda, /projects, /notes, /travel, /habits
```

---

## Multi‑Agent Orchestrator Prompt (for Claude Code)

> Use this verbatim to spin up **Infra/Web/Docs/QA** agents and complete Push 1.

```text
You are the coordinator for **Project Cortex — Push 1 (Next.js PWA Shell)**. Spawn agents (Web, UI, Docs, QA) and execute exactly as specified.

Branch: `push/01-web-shell`

Constraints:
- No backend or DB work in this push.
- Use Next.js 14 (App Router), TypeScript, Tailwind, Radix UI, cmdk, TanStack Query.
- PWA via next-pwa. Icons may be placeholder PNGs as provided.
- Paths and file contents must match this document exactly.

=== Plan ===

1) Create files and directories per “Repository Changes” and “File Contents” sections.
2) Install dependencies from package.json.
3) Initialize Husky and replace `.husky/pre-commit` content (as shown).
4) Update README with the “Push 1” snippet.
5) Run the QA checklist and record results in the PR description (screenshots allowed).

=== Roles ===

- **Web Agent**: Scaffold Next.js app, Tailwind, PWA config, pages/components.
- **UI Agent**: Implement Topbar, CommandPalette, KeyboardShortcuts; ensure accessibility (labels, focus).
- **Docs Agent**: Update README with usage; note that SW is prod-only.
- **QA Agent**: Run dev and prod builds; confirm palette navigation; verify manifest and SW in Application panel.

=== Commands (QA) ===

- `pnpm install`
- `pnpm dev` → visit `/`, `/agenda`, `/projects`, `/notes`, `/travel`, `/habits`
- `pnpm build && pnpm start` → verify manifest & service worker
- Attempt commit to trigger Husky: `git add -A && git commit -m "test"`

=== Deliverables ===

- Branch `push/01-web-shell` with files present.
- PR describing: how to run, screenshots, acceptance checklist results.
```

---

## Appendix — Notes on Next/PWA

- **next-pwa** generates a Workbox service worker at build time (`public/sw.js`) and registers it automatically.
- We disable SW in dev to avoid caching confusion; production build enables it.
- For real icons, replace the placeholder PNGs in `public/icons/` with 192×192 and 512×512 PNGs.
