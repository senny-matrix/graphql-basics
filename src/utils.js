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
