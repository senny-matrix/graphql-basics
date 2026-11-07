import { toId, toPagination } from "../utils.js";

// Every query is async: Prisma talks to Postgres, and every database round
// trip returns a Promise. GraphQL awaits resolvers for us, so the queries
// clients send are unchanged.
const Query = {
    async users(parent, args, { prisma }, info) {
      const { take, skip } = toPagination(args);

      if (!args.query) {
        return prisma.user.findMany({ take, skip });
      }

      // `mode: "insensitive"` is Postgres ILIKE; without it the search would
      // be case-sensitive and "rogers" would not match "Rogers".
      return prisma.user.findMany({
        where: {
          name: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        take,
        skip,
      });
    },

    async posts(parent, args, { prisma }, info) {
      const { take, skip } = toPagination(args);

      if (!args.query) return prisma.post.findMany({ take, skip });

      return prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: args.query, mode: "insensitive" } },
            { body: { contains: args.query, mode: "insensitive" } },
          ],
        },
        take,
        skip,
      });
    },

    async comments(parent, args, { prisma }, info) {
      const { take, skip } = toPagination(args);

      return prisma.comment.findMany({ take, skip });
    },

    // Single-record lookups. Both return a nullable type on purpose: asking
    // for an id that does not exist is a normal outcome, so the client gets
    // `null` and can show "not found" without treating it as an error.
    async user(parent, args, { prisma }, info) {
      const id = toId(args.id);

      return prisma.user.findUnique({ where: { id } });
    },

    async post(parent, args, { prisma }, info) {
      const id = toId(args.id);

      return prisma.post.findUnique({ where: { id } });
    },

    // `me` is a placeholder for "the logged-in user" until auth exists.
    // It returns a nullable User so an empty database yields `null` rather
    // than a "Cannot return null for non-nullable field" error.
    async me(parent, args, { prisma }, info) {
      return prisma.user.findFirst();
    },
};

export default Query;
