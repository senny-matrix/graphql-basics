# GraphQL Basics — Nuxt frontend

A small Nuxt 4 app that consumes the Yoga + Prisma + Postgres API in the parent
folder over a single `/graphql` endpoint.

## Quick start

The backend must be running first (it owns the database connection):

```bash
# terminal 1 — backend
cd ..
npm run dev          # http://localhost:4000/graphql
docker compose ps    # postgres + pgadmin should be Up

# terminal 2 — frontend
npm install
npm run dev          # http://localhost:3000
```

## Node version

Nuxt 4 needs Node `^22.21.0 || ^24.11.0 || >=26`. This repo is developed on
**24.14.0**; the machine's default 22.16 is too old and prints a warning.

```bash
eval "$(fnm env)" && fnm use 24.14.0
```

## How it talks to the backend

The browser never calls `:4000` directly. `nuxt.config.ts` proxies `/graphql`
through Nitro, so:

- the browser sees one origin → **no CORS setup needed**,
- the backend URL lives in `GRAPHQL_ENDPOINT` (default `http://127.0.0.1:4000/graphql`)
  and can change without rebuilding the client,
- during SSR the absolute URL is used, in the browser the relative one is.

## Pages

| Route | What it shows |
|---|---|
| `/` | dashboard: counts + 3 most recent posts (two queries in parallel, SSR) |
| `/posts` | list, server-side search (`?q=`), create, delete |
| `/posts/:id` | detail, `post(id:)` lookup, add/delete comments, **live comment subscription** |
| `/users` | list, server-side search, create (shows the duplicate-email error) |
| `/users/:id` | detail, `user(id:)` lookup, posts + comments relations |
| `/live` | subscription playground — trigger post events and watch them arrive |

## Files worth reading

```
app/composables/useGraphQL.ts   the whole client: fetch wrapper, SSR-aware URL,
                                mutation helper, and the SSE subscription helper
app/utils/documents.ts          every GraphQL document, in one place
app/pages/posts/index.vue       debounced search + optimistic-free create/delete
app/pages/live.vue              subscriptions end to end
```

## Subscriptions are SSE, not WebSockets

graphql-yoga serves subscriptions over Server-Sent Events on the same
`/graphql` URL. That means the browser's built-in `EventSource` can consume
them — no `graphql-ws`, no socket server. The subscription travels as a GET
query parameter because `EventSource` cannot send a body:

```
GET /graphql?query=subscription{...}&variables={"postId":"10"}
```

Verified through the Nitro proxy: a `createPost` mutation fired an event that
arrived at the browser as `text/event-stream`.

## Known limitation

Resolved. The dashboard originally fetched whole rows and read `.length`, which
serialised every post title into the SSR payload. It now uses the dedicated
`userCount` / `postCount` / `commentCount` queries, so the count request is a
55-byte response and no unrelated rows travel with it.

Use the aggregate fields for any future count: `posts(limit: 100).length` is
only correct up to the page cap, and `userCount` is a single `SELECT COUNT(*)`.
