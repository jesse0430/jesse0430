

<!--
**jesse0430/jesse0430** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
# Next.js App Router + MUI + Redux Toolkit + Redux-Saga

## Scripts

- dev: Run local dev server
- build: Build for production
- start: Start production server

## Environment

- Provide `BACKEND_URL` via `.env.production` or Docker build arg to control rewrite target.

## Rewrites

Requests to `/api/*` are proxied to `${BACKEND_URL}/*` using `next.config.js`.

## Docker

Build:

```bash
docker build -t nextjs-app:latest --build-arg BACKEND_URL=https://api.example.com .
```

Run:

```bash
docker run -p 3000:3000 --name nextjs-app nextjs-app:latest
```

## Local Dev

```bash
npm install
npm run dev
```
