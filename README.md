# GraphQL Basics — API + Nuxt frontend

One repo, two runnable halves:

| Path | What | Runs on |
|---|---|---|
| `src/` | GraphQL Yoga API (schema, resolvers) | `:4000` |
| `prisma/` | Schema, migrations, seed | — |
| `docker-compose.yml` | Postgres (and pgAdmin GUI) | `:5432`, `:5050` |
| `frontend/` | Nuxt 4 app that consumes the API | `:3000` |

Nitro proxies `/graphql` from the frontend to the API, so the browser only ever
talks to one origin. That is why the API needs no CORS setup.

## First run

```bash
# 1. database
cp .env.example .env        # then edit if needed
docker compose up -d

# 2. API
npm install                 # postinstall runs `prisma generate`
npm run db:migrate          # create tables
npm run db:seed             # 3 users / 3 posts / 4 comments
npm run dev                 # http://localhost:4000/graphql

# 3. frontend (in a second terminal)
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

## Node version

The frontend needs Nuxt 4's minimum (`^22.21.0 || ^24.11.0 || >=26`).
This project was developed on **24.14.0**:

```bash
eval "$(fnm env)" && fnm use 24.14.0
```

## Handy commands

```bash
npm run db:studio           # Prisma Studio on :5555
docker compose ps           # postgres + pgadmin health
npx prisma studio           # inspect/edit rows visually
```

pgAdmin: <http://127.0.0.1:5050> — add a server with host `postgres`
(the *service* name, not `localhost`), user/db `graphql`, password `graphql`.

## Layout note

`frontend/` was formerly a separate repository. It was merged in as a subtree
(merge commit `b22d2e9`) so its history is preserved. It keeps its own
`.gitignore`, which is what excludes `frontend/node_modules`, `.nuxt` and
`.output` from this repo.
