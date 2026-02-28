# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates the code, and a virtual file system renders the preview in real-time. No files are written to disk.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Dev server with Turbopack (localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (all tests)
npx vitest run src/path/to/file.test.ts  # Single test file
npm run db:reset       # Reset SQLite database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create/apply new migration
```

Dev server uses a Node.js compatibility shim (`node-compat.cjs`) for Node 25+ Web Storage SSR support.

## Architecture

### Stack
Next.js 15 (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS v4 / Prisma + SQLite / Vercel AI SDK + Anthropic Claude

### Key Patterns

**AI Generation Pipeline:** Chat messages hit `/src/app/api/chat/route.ts`, which uses Vercel AI SDK with Claude. The AI uses tool-based agents (`str_replace_editor` for file CRUD, `file_manager` for rename/delete) defined in `/src/lib/tools/`. System prompt lives in `/src/lib/prompts/generation.tsx`. When no `ANTHROPIC_API_KEY` is set, a mock provider returns static code.

**Virtual File System:** `VirtualFileSystem` class in `/src/lib/file-system.ts` stores all generated files in memory. Serialized to JSON for database persistence. Managed via `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`).

**State Management:** Two React Contexts — `ChatContext` (messages, input, submission) and `FileSystemContext` (virtual files, active file). No external state library.

**Auth:** Optional JWT-based auth via `/src/lib/auth.ts`. Server actions in `/src/actions/` handle sign-up/sign-in. Middleware protects routes. Anonymous users can work with localStorage persistence (`anon-work-tracker.ts`).

**Database:** Prisma with SQLite (`prisma/dev.db`). Schema defined in `prisma/schema.prisma` — always reference it for data structure. Two models: `User` and `Project`. Projects store chat messages and file system data as JSON string fields.

### Layout Structure
Split-panel UI using `react-resizable-panels`: Chat panel (left) + Preview/Code panel (right). Components organized by feature: `/src/components/chat/`, `/src/components/editor/`, `/src/components/preview/`, `/src/components/auth/`. UI primitives from shadcn/ui in `/src/components/ui/`.

### Path Aliases
`@/*` maps to `./src/*` (configured in `tsconfig.json` and `components.json`).

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. Without it, mock provider returns static responses.
- `JWT_SECRET` — Optional. Defaults to `"development-secret-key"`.
- `DATABASE_URL` — Implicit, SQLite at `prisma/dev.db`.

## Testing

Vitest with jsdom environment. Uses Testing Library. Test files live in `__tests__` directories colocated with source.
