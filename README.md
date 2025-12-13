# Wanda CRM API

This repository contains the initial Node.js/TypeScript backend for Wanda's blog and CMS.

## Requirements

- Node.js 18+
- Postgres 14+

## Setup

```bash
cp env.example .env
npm install
npm run dev
```

### Database

Create a Postgres database and set `DATABASE_URL` in your `.env` file. The service uses Sequelize to manage the `users` and `sessions` tables used for JWT auth.

### Creating an admin user

Run the helper script:

```bash
npm run create:user -- --email admin@example.com --password "StrongPass123" --role admin
```

Once the user exists you can log in via `POST /api/auth/login` to receive an access + refresh token pair.

## Content storage

All posts live in `content/posts` as Markdown files, with YAML front matter describing metadata (title, summary, hero image URL, status, etc.). CMS APIs manipulate those files directly, so the public blog can stay static-friendly and easy to version.

## Frontend branding defaults (hero)

- The public homepage hero (image + title + subtitle) is configured in `frontend/src/config/branding.ts`.
- Default assets live in `frontend/public/branding/portrait.jpg`. Replace that file to change the hero image (no code change needed). Keep the same filename or update the `image` path in `branding.ts`.
- Default text:
  - `title: "Wanda Pawlowska"`
  - `subtitle: "Web3 Marketing & PR · Content Creation · Events"`
- The hero only renders on the homepage (`/`) and not on individual posts. Minimal CSS lives in `frontend/src/App.css` (selectors prefixed with `.post-hero`).
- Backend defaults to port `4000`; frontend dev defaults to `5173` with `VITE_API_BASE_URL` falling back to `http://localhost:4000/api`.

## Scripts

- `npm run dev` – start the API with `ts-node-dev`
- `npm run build` – compile TypeScript to `dist`
- `npm start` – run the compiled server
- `npm run lint` – type-check without emitting files
- `npm run create:user` – helper to seed an account
