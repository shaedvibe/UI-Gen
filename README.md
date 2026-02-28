# UIGen

AI-powered React component generator with a live preview and editable virtual file system.

## Quickstart

Prerequisites:
- Node.js 18+
- npm

1. (Optional) Create a `.env` in the project root and set your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

2. Install dependencies and initialize the database:

```bash
npm run setup
```

3. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

If no `ANTHROPIC_API_KEY` is provided the app will return static example code instead of using the LLM.

## Project Overview

UIGen lets you describe React components in a chat interface and generates component code (with a live preview). Generated files are held in a virtual in-memory file system and can be edited in-place.

Key features:
- AI-driven component generation (Anthropic Claude via Vercel AI SDK)
- Live preview with hot-reload
- Virtual file system (no files written to disk unless exported)
- Syntax-highlighted editor and file tree
- Persist projects for registered users using Prisma + SQLite

## Scripts

- `npm run setup` — install deps, generate Prisma client, and run migrations
- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run test` — run Vitest tests

## Development Notes

- The app uses Next.js App Router and is written in TypeScript.
- Virtual file system implementation: `src/lib/file-system.ts` and `src/lib/contexts/file-system-context.tsx`.
- API route for chat generation: `src/app/api/chat/route.ts`.
- If you want to run without Anthropic, remove `ANTHROPIC_API_KEY` and the project will use a mock response provider.

## Contributing

Issues and PRs are welcome. A suggested workflow:

1. Fork the repo and create a feature branch.
2. Run `npm run setup` then `npm run dev` locally.
3. Add tests (Vitest + Testing Library) for new features.
4. Open a PR describing your change.

## License

This project is provided under the MIT License. See `LICENSE` for details.

## Acknowledgements

Built with Next.js, React, Tailwind CSS, Prisma, and Anthropic Claude.
