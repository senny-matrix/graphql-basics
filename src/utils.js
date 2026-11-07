// GraphQL declares ids as `ID!`, which arrives in a resolver as a String
// ("1"). Postgres stores them as integers. Passing the string straight to
// Prisma fails with an unhelpful type error, and Number("abc") silently
// becomes NaN, so convert explicitly and fail with a message the client
// can actually act on.
export function toId(value, label = "id") {
  const id = Number(value);

  if (!Number.isInteger(id)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }

  return id;
}

// Cap on how many rows a single list query may return. Without it a client
// can stream the whole table to the browser; with it a page is always bounded.
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

// Translate the optional `limit` / `offset` arguments into Prisma's
// `take` / `skip`. Both are optional, so an unbounded caller still works,
// but a negative or absurd value is rejected instead of silently ignored.
export function toPagination({ limit, offset }) {
  if (typeof limit !== "undefined" && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error(`Invalid limit: ${limit}`);
  }

  if (typeof offset !== "undefined" && (!Number.isInteger(offset) || offset < 0)) {
    throw new Error(`Invalid offset: ${offset}`);
  }

  const take = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  return { take, skip: offset ?? 0 };
}
