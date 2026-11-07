// The column is `authorId` (a scalar), not `author` (a relation object).
// The in-memory version stored `author: "1"` on the post; Prisma stores the
// foreign key in `parent.authorId`, so read that instead.
const Post = {
    async author(parent, args, { prisma }, info) {
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },

    async comments(parent, args, { prisma }, info) {
      return prisma.comment.findMany({ where: { postId: parent.id } });
    },
};

export default Post;
