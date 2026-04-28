# MindFlow

A modern, full-stack mind mapping application built with React, TypeScript, and Express. Create, style, and organize beautiful mind maps with real-time drag-and-drop.

## Features

- **Infinite Canvas** — Create unlimited nodes with hierarchical tree layout powered by D3.js
- **Drag & Drop** — Reparent and reorder nodes by dragging; move nodes with keyboard arrows
- **Rich Styling** — Customize node shapes (rectangle, rounded, pill, underline), colors, fonts, and connection lines
- **Undo / Redo** — Full undo/redo history for all tree operations
- **Collapsible Branches** — Collapse and expand subtrees to focus on what matters
- **Auto-Save** — Changes save automatically to the server with debounce
- **Export** — Export mind maps as JSON, PNG, or Markdown
- **Import** — Import from JSON or XMind files
- **Multi-Language** — Chinese and English UI with runtime switching
- **Authentication** — JWT-based auth with access/refresh token rotation
- **Responsive Panels** — Collapsible sidebar, property panel, and toolbar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State** | Zustand (with undo/redo stacks) |
| **Routing** | React Router DOM v6 |
| **Layout** | D3.js (d3-hierarchy, d3-zoom, d3-shape) |
| **HTTP Client** | Ky (with JWT interceptors) |
| **Icons** | Lucide React |
| **Backend** | Express 4, TypeScript |
| **Database** | MongoDB + Mongoose (with in-memory fallback) |
| **Auth** | JWT (HS256), bcryptjs |
| **Validation** | Zod |
| **Package Manager** | npm workspaces (monorepo) |

## Project Structure

```
mindflow/
├── packages/shared/       # Shared TypeScript types (@mindflow/shared)
├── client/                # React frontend (Vite)
│   └── src/
│       ├── api/           # HTTP client and API modules
│       ├── components/    # React components
│       │   ├── auth/      # Login, register, protected route
│       │   ├── common/    # Spinner, toast, confirm dialog
│       │   ├── layout/    # AppShell, sidebar, toolbar, property panel
│       │   ├── mindmap/   # Canvas, node, connection line, minimap
│       │   ├── panels/    # Style editor, notes editor
│       │   └── sidebar/   # Mind map list, user menu
│       ├── hooks/         # Auto-save, drag node, keyboard shortcuts
│       ├── lib/           # D3 layouts, export utils, i18n
│       └── stores/        # Zustand stores
└── server/                # Express backend
    └── src/
        ├── config/        # Environment, database connection
        ├── controllers/   # Route handlers
        ├── middleware/    # Auth, error handling, validation
        ├── models/        # Mongoose schemas
        ├── routes/        # Express routers
        ├── services/      # Business logic, seeding
        └── validators/    # Zod request schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (optional — falls back to in-memory server for development)

### Installation

```bash
cd mindflow
npm install
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/mindflow` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | (dev secret) | Access token signing key |
| `JWT_REFRESH_SECRET` | (dev secret) | Refresh token signing key |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |

### Development

Start both servers concurrently:

```bash
npm run dev
```

This launches:
- **Backend** on `http://localhost:4000`
- **Frontend** on `http://localhost:5173`

### Default Account

On first startup, a demo account is seeded:

- **Username:** `admin`
- **Password:** `123456`

A sample mind map with Chinese tutorial content is also created.

### Build

```bash
npm run build
```

Build output: `client/dist/` (static files) and `server/dist/` (compiled backend).

## API Overview

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in (returns tokens) |
| `POST` | `/api/auth/refresh` | Rotate refresh token |
| `GET` | `/api/auth/me` | Get current user |

### Mind Maps

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mindmaps` | List user's mind maps |
| `POST` | `/api/mindmaps` | Create mind map |
| `GET` | `/api/mindmaps/:id` | Get mind map with full tree |
| `PATCH` | `/api/mindmaps/:id` | Update mind map (title, tree, theme) |
| `DELETE` | `/api/mindmaps/:id` | Delete mind map |
| `POST` | `/api/mindmaps/import` | Import JSON or XMind file |

### Nodes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/mindmaps/:id/nodes` | Add node |
| `PATCH` | `/api/mindmaps/:id/nodes/:nodeId` | Update node |
| `DELETE` | `/api/mindmaps/:id/nodes/:nodeId` | Delete node |
| `PUT` | `/api/mindmaps/:id/nodes/:nodeId/move` | Move node to new parent |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Add child node |
| `Enter` | Add sibling node |
| `Delete` | Delete selected node |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save manually |
| `F2` | Rename selected node |
| `Arrow Keys` | Move node position within parent |

## License

MIT
