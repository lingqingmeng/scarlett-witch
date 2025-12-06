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

## Scripts

- `npm run dev` – start the API with `ts-node-dev`
- `npm run build` – compile TypeScript to `dist`
- `npm start` – run the compiled server
- `npm run lint` – type-check without emitting files
- `npm run create:user` – helper to seed an account
