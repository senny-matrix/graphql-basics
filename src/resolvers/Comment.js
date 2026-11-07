// Same story as Post.js: the relations are reached through the foreign key
// columns authorId / postId rather than the old author / post string fields.
const Comment = {
    async author(parent, args, { prisma }, info) {
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },

    async post(parent, args, { prisma }, info) {
      return prisma.post.findUnique({ where: { id: parent.postId } });
    },
};

export default Comment;
