// Every query is now async: Prisma talks to Postgres, and every database
// round trip returns a Promise. GraphQL awaits resolvers for us, so the
// schema and the queries clients send are unchanged.
const Query = {
    async users(parent, args, { prisma }, info) {
      if (!args.query) {
        return prisma.user.findMany();
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
      });
    },

    async posts(parent, args, { prisma }, info) {
      if (!args.query) return prisma.post.findMany();

      return prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: args.query, mode: "insensitive" } },
            { body: { contains: args.query, mode: "insensitive" } },
          ],
        },
      });
    },

    async comments(parent, args, { prisma }, info) {
      return prisma.comment.findMany();
    },

    // `me` is a placeholder for "the logged-in user" until auth exists.
    // It used to return a hardcoded object with the fake id "123-abc", which
    // Prisma-backed relations cannot follow, so it now returns a real row.
    async me(parent, args, { prisma }, info) {
      const user = await prisma.user.findFirst();

      if (!user) throw new Error("No users in the database");

      return user;
    },

    async post(parent, args, { prisma }, info) {
      const post = await prisma.post.findFirst();

      if (!post) throw new Error("No posts in the database");

      return post;
    },
};

export default Query;
