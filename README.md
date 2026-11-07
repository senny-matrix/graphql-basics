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

**The lesson branches.** Every step that built this app is a branch, numbered
`00`, `01`, `02` … in the order you work through them. The numbers are
contiguous, so the list *is* the lesson sequence:

```bash
git branch -r | grep -v archive | sort      # list the lessons
```

| # | Branch | # | Branch |
|---|---|---|---|
| 00 | `00-initial_graphql_server` | 16 | `16-challenge_part_2_solution` |
| 01 | `01-creating_custom_types` | 17 | `17-challenge_part_3` |
| 02 | `02-operation_arguments` | 18 | `18-creating_data_with_mutations_part_1` |
| 03 | `03-operation_arguments_check_your_understanding` | 19 | `19-creating_data_with_mutation_part_2` |
| 04 | `04-operation_arguments_cyu_solution` | 20 | `20-the_input_type` |
| 05 | `05-working_with_arrays_part_1` | 21 | `21-input_for_create_comment` |
| 06 | `06-working_with_arrays_part_2` | 22 | `22-deleting_data_with_mutation_part_1` |
| 07 | `07-array_with_parameters` | 23 | `23-deleting_data_with_mutation_part_2` |
| 08 | `08-challenge_post_array` | 24 | `24-project_structure` |
| 09 | `09-challenge_solution_part_1` | 25 | `25-update_mutations` |
| 10 | `10-challenge_solution_part_2` | 26 | `26-graphql_subscription_basics` |
| 11 | `11-relationship` | 27 | `27-comment_subscription` |
| 12 | `12-relationship_from_user_side` | 28 | `28-post_subscription` |
| 13 | `13-comments_challenge_part_1` | 29 | `29-expanding_the_post` |
| 14 | `14-challenge_part_1_solution` | 30 | `30-delete_post_subscription` |
| 15 | `15-challenge_part_2` | 31 | `31-comment_subscription_payload` |

Each branch is a strict descendant of the one before it, so switching between
them only ever adds or removes that lesson's changes. Nothing later is ever
pulled in early.

To sit on a lesson and do your own work on top of it:

```bash
git switch 11-relationship        # move to that lesson
vim src/schema.graphql            # edit freely
git switch -c my-solution         # (optional) keep your work on a branch
```

> `dev` and `00-initial_graphql_server` point at the **same** commit
> (`5b083df`, the very first one), so either works as the starting point.

### `main` is the finished app, not lesson 32

After lesson 31 the course project moves on: Postgres + Prisma replace the
in-memory arrays, the API gains single-record and count queries, and the Nuxt
frontend arrives. That work is on `main`, which is what `git clone` gives you
by default. Start from `git switch 00-initial_graphql_server` if you want the
course beginning.

### `archive/` branches

A few early branches predate this numbering and sit off to the side of `main`'s
history. They are kept, never deleted, but are not part of the sequence:

```
archive/01-graphql_scalar_types           first attempt at scalars, superseded by 01
archive/02-check_your_self                question-only branch, content lives in 03
archive/03-check_yourself_solution        answer to the above
archive/10-challenge_solution_part_2_abandoned   an abandoned 3-line fix; real solution is 10
archive/32-update_sub_and_beyond          the old tip: subscriptions + Prisma + Nuxt mixed
```

### Renamed in November 2026

Branches were renumbered so the sequence has no duplicates or gaps. If a
handout or video refers to an old name, here is the mapping:

| Old | New |
|---|---|
| `03-creating_custom_types` | `01-creating_custom_types` |
| `04-operation_arguments` | `02-operation_arguments` |
| `05-…_check_your_understanding` | `03-…_check_your_understanding` |
| `06-…_CYU_solution` | `04-…_cyu_solution` |
| `07-working_with_arrays_part_1` | `05-working_with_arrays_part_1` |
| `08-working_with_arrays_part_2` | `06-working_with_arrays_part_2` |
| `09-array_part_2_with_parameters` | `07-array_with_parameters` |
| `10-your_challenge_post_array` | `08-challenge_post_array` |
| `11-challenge_solution` | `09-challenge_solution_part_1` |
| `12-solution_part_2` | `10-challenge_solution_part_2` |
| `13-relationship` | `11-relationship` |
| `14-relationship_from_user_side` | `12-relationship_from_user_side` |
| `15-comments_challenge_part_1` | `13-comments_challenge_part_1` |
| `16-challenge_part_1_solution` | `14-challenge_part_1_solution` |
| `17-challenge_part_2` | `15-challenge_part_2` |
| `18-challenge_part_2_solution` | `16-challenge_part_2_solution` |
| `19-challenge_part_3` | `17-challenge_part_3` |
| `20-creating_data_with_mutations_part_1` | `18-creating_data_with_mutations_part_1` |
| `21-creating_data_with_mutatiton_part_2` | `19-creating_data_with_mutation_part_2` |
| `22-the_input_type` | `20-the_input_type` |
| `23-input_for_createComment` | `21-input_for_create_comment` |
| `23-deleting_data_with_mutation_part_1` | `22-deleting_data_with_mutation_part_1` |
| `24-delete_mutation_part_2` | `23-deleting_data_with_mutation_part_2` |
| `25-pro_graphql_project_structure` | `24-project_structure` |
| `26-pro_graphql_project_structure` | `25-update_mutations` |
| `27-graphql_subscription_basics` | `26-graphql_subscription_basics` |
| `28-comment_subscription` | `27-comment_subscription` |
| `29-post_subscription` | `28-post_subscription` |
| `30-expanding_the_post` | `29-expanding_the_post` |
| `31-delete_post_sub` | `30-delete_post_subscription` |
| `32-update_sub` | `31-comment_subscription_payload` (+ `main` for the rest) |

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
