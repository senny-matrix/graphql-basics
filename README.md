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

## Where to start (the first lesson)

`main` is the **finished** app. If you want the very first lesson instead — the
bare GraphQL server before any schema or database work — check out its branch:

```bash
git clone git@github.com:senny-matrix/graphql-basics.git
cd graphql-basics
git switch 00-initial_graphql_server
```

That leaves you with just `index.js` (a minimal GraphQL Yoga server) and its
`package.json`. It is the starting point for the whole course.

**Quick-start (clone that lesson directly, no switching):**

```bash
git clone -b 00-initial_graphql_server git@github.com:senny-matrix/graphql-basics.git
```

> **For HTTPS users:** replace `git@github.com:senny-matrix/…` with
> `https://github.com/senny-matrix/…` in the commands above.

**The lesson branches.** Every commit that built this app is tagged as a branch,
in order, so you can follow the course one step at a time:

```bash
git branch -r | sort          # list them all
# 00-initial_graphql_server
# 01-graphql_scalar_types
# 02-check_your_self
# ...
# 32-update_sub
# dev  (same starting point as 00-initial_graphql_server)
```

To sit on a lesson and do your own work on top of it:

```bash
git switch 13-relationship        # move to that lesson
vim src/schema.graphql            # edit freely
git switch -c my-solution         # (optional) keep your work on a branch
```

> Note: `dev` and `00-initial_graphql_server` point at the **same** commit
> (`5b083df`, the very first one), so either works as the starting point.

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
