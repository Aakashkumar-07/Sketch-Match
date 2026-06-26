
<div align="center">
  <h1>✏️ Sketch Match</h1>
  <p>
    <strong>A modern, real-time collaborative drawing and sketching application</strong>
  </p>
  <p>
    Create beautiful hand-drawn style diagrams, wireframes, and sketches — together in real-time.
  </p>
</div>

<div align="center">

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

</div>

---

## ✨ Features

- 🎨 **Intuitive Drawing Tools** — Pen, shapes (rectangle, circle), arrows, lines, and text
- 🤝 **Real-time Collaboration** — Draw together with others on the same board, live cursors included
- 🌓 **Dark / Light Mode** — Seamless theme switching with theme-aware stroke colors
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- ⚡ **Pressure-Sensitive Drawing** — Realistic strokes via a built-in Perfect Freehand engine
- 🔄 **Undo / Redo** — Full history management (50-step memory)
- 🔍 **Zoom & Pan** — Scroll to zoom, drag to pan across large canvases
- 📤 **Export** — PNG, SVG, and JSON export
- 💾 **Auto-save to Local Storage** — Never lose your work
- ⌨️ **Keyboard Shortcuts** — Speed up your workflow
- 🎯 **Precise Selection** — Select, move, resize, and multi-select elements
- 📐 **Grid System** — Toggle grid for precise alignment
- ✏️ **Inline Text Editing** — Double-click to add or edit text directly on canvas
- 🎨 **Color & Opacity Controls** — Stroke/fill color picker with opacity slider

## 📸 Screenshots

<!-- Replace these with actual screenshots of your running app -->

| Light Mode | Dark Mode |
|---|---|
| *Screenshot placeholder — light mode* | *Screenshot placeholder — dark mode* |

| Collaboration | Export |
|---|---|
| *Screenshot placeholder — collaboration* | *Screenshot placeholder — export dialog* |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** (or yarn / pnpm)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd sketch-match
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (optional — only needed for collaboration)

```bash
cp .env.example .env.local
```

Add your [Supabase](https://supabase.com) credentials if you want real-time collaboration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

> **Note:** The app works fully in single-user mode without any Supabase configuration.

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser** at [http://localhost:3000](http://localhost:3000)

### Supabase Setup (for Collaboration)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL from `scripts/create-collaboration-tables.sql` in your Supabase SQL Editor
3. Copy your project URL and anon key to `.env.local`
4. Restart the dev server

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Drawing Engine** | Built-in Perfect Freehand implementation |
| **Collaboration** | [Supabase Realtime](https://supabase.com/realtime) (Broadcast + Presence) |

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Select Tool | `V` or `1` |
| Hand (Pan) Tool | `H` or `2` |
| Pen Tool | `P` or `3` |
| Line Tool | `L` or `4` |
| Rectangle | `R` or `5` |
| Circle | `C` or `6` |
| Arrow | `A` or `7` |
| Text | `T` or `8` |
| Undo | `Ctrl + Z` |
| Redo | `Ctrl + Y` |
| Delete Selected | `Delete` / `Backspace` |
| Clear Selection | `Escape` |
| Zoom In | `+` or `=` |
| Zoom Out | `-` |
| Reset Zoom | `Ctrl + 0` |
| Toggle Grid | Grid button in toolbar |

## 🤝 Collaboration

1. Click **"Collaborate"** in the top-right corner
2. Enter your display name
3. **Create** a new session or **Join** an existing one by session ID
4. Share the session link or ID with others
5. See real-time cursors and changes from all collaborators

## 📁 Project Structure

```
sketch-match/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main app entry point
│   └── globals.css         # Global styles & CSS variables
├── components/             # React components
│   ├── drawing-canvas.tsx  # Main canvas with drawing logic
│   ├── drawing-toolbar.tsx # Tool selection bar
│   ├── collaboration-panel.tsx  # Collaboration UI
│   ├── export-import.tsx   # Export/Import dialogs
│   ├── properties-panel.tsx # Shape properties editor
│   └── ui/                 # shadcn/ui primitives
├── lib/                    # Core logic
│   ├── canvas-store.ts     # Zustand store for canvas state
│   ├── collaboration.ts    # Supabase Realtime collaboration manager
│   ├── store.ts            # Extended store with local storage
│   └── supabase/           # Supabase client setup
├── types/                  # TypeScript type definitions
├── scripts/                # Database migration scripts
└── public/                 # Static assets (favicon, manifest)
```

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

This project is a derivative of [LetMeSketch](https://github.com/HassanXTech/letmesketch) by HassanXTech, also MIT licensed.

## 🙏 Acknowledgments

- Originally derived from [LetMeSketch](https://github.com/HassanXTech/letmesketch) by HassanXTech
- Drawing engine inspired by [Perfect Freehand](https://github.com/steveruizok/perfect-freehand)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Real-time collaboration powered by [Supabase Realtime](https://supabase.com/realtime)
