// `parent` is now a Prisma User row, so its primary key is `parent.id`.
// Keep the shape of these resolvers simple: one query per field, scoped by
// the foreign key. GraphQL only calls them when a client actually asks for
// the field, so the extra round trips only happen when they are needed.
const User = {
    async posts(parent, args, { prisma }, info) {
      return prisma.post.findMany({ where: { authorId: parent.id } });
    },

    async comments(parent, args, { prisma }, info) {
      return prisma.comment.findMany({ where: { authorId: parent.id } });
    },
};

export default User;
