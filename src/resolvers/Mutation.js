import { toId } from "../utils.js";

// Prisma throws PrismaClientKnownRequestError with code P2002 when a unique
// constraint is violated. The pre-checks below keep the friendly messages the
// API already returned; this helper is the safety net for the race between the
// check and the insert.
function isUniqueViolation(error) {
  return error?.code === "P2002";
}

const Mutation = {
    async createUser(_parent, args, { prisma }) {
      const { data } = args;

      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailTaken) {
        throw new Error("Email already taken");
      }

      try {
        return await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            age: data.age ?? null,
          },
        });
      } catch (error) {
        if (isUniqueViolation(error)) throw new Error("Email already taken");
        throw error;
      }
    },

    async updateUser(_parent, args, { prisma }) {
        const id = toId(args.id);
        const { data } = args;

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) throw new Error("User not found");

        // Build the update explicitly: Prisma treats `undefined` as "leave this
        // field alone", which is what we want for fields the client omitted.
        // `typeof null !== "undefined"`, so an explicit `age: null` clears it.
        const updates = {};

        if (typeof data.email === "string") {
            const emailTaken = await prisma.user.findFirst({
                where: { email: data.email, NOT: { id } },
            });

            if (emailTaken) throw new Error("Email already taken");
            updates.email = data.email;
        }

        if (typeof data.name === "string") updates.name = data.name;

        if (typeof data.age !== "undefined") updates.age = data.age;

        // Nothing to change: skip the round trip, but still return the row.
        if (Object.keys(updates).length === 0) return user;

        return prisma.user.update({ where: { id }, data: updates });
    },

    async deleteUser(_parent, args, { prisma }) {
      const id = toId(args.id);

      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new Error("User not found");
      }

      // No manual cascade any more: the foreign keys were created with
      // ON DELETE CASCADE, so deleting the user removes its posts and
      // comments inside a single database transaction.
      await prisma.user.delete({ where: { id } });

      return user;
    },

    async createPost(_parent, args, { prisma, pubsub }) {
      const { data } = args;
      const authorId = toId(data.author, "author");

      const userExists = await prisma.user.findUnique({ where: { id: authorId } });

      if (!userExists) {
        throw new Error("Author not found");
      }

      const post = await prisma.post.create({
        data: {
          title: data.title,
          body: data.body,
          published: data.published,
          authorId,
        },
      });

      if (post.published) {
        pubsub.publish('post', {
          post: {
          mutation: 'CREATED',
          data: post
          }
        })
      }
      return post;
    },

    async updatePost(_parent, args, { prisma, pubsub }) {
        const id = toId(args.id);
        const { data } = args;

        const originalPost = await prisma.post.findUnique({ where: { id } });

        if (!originalPost) throw new Error("Post not found!");

        const updates = {};

        if (typeof data.author === "string") {
            const authorId = toId(data.author, "author");
            const userExists = await prisma.user.findUnique({ where: { id: authorId } });

            if (!userExists) throw new Error("Author not found");
            updates.authorId = authorId;
        }

        if (typeof data.title === "string") updates.title = data.title;

        if (typeof data.body === "string") updates.body = data.body;

        if (typeof data.published === "boolean") updates.published = data.published;

        // Skip the write when the client sent nothing, but keep the publish
        // logic below working off the current row.
        const post = Object.keys(updates).length === 0
          ? originalPost
          : await prisma.post.update({ where: { id }, data: updates });

        if (typeof data.published === "boolean") {

          if (originalPost.published && !post.published){
            // delete
            pubsub.publish('post', {
              post: {
                mutation: 'DELETED',
                data: originalPost
              }
            });
          }else if ( !originalPost.published && post.published){
            // create
            pubsub.publish('post', {
              post: {
                mutation: 'CREATED',
                data: post
              }
            });
          }else if (originalPost.published && post.published){
            // update on an already-published post
            pubsub.publish('post', {
              post: {
                mutation: 'UPDATED',
                data: post
              }
            });
          }
        }else if (post.published){
          // update of title/body/author on a published post (published flag untouched)
          pubsub.publish('post', {
            post: {
              mutation: 'UPDATED',
              data: post
            }
          })
        }
        return post;
    },

    async deletePost(_parent, args, { prisma, pubsub }) {
      const id = toId(args.id);

      // Check if the Post exists
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) throw new Error("Post not found!");

      // Comments cascade with the post (ON DELETE CASCADE), so there is no
      // separate db.comments.filter step here any more.
      await prisma.post.delete({ where: { id } });

      if(post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: post
          }
        })
      }

      return post;
    },

    async createComment(_parent, args, { prisma, pubsub }) {
      const { data } = args;
      const authorId = toId(data.author, "author");
      const postId = toId(data.post, "post");

      const userExists = await prisma.user.findUnique({ where: { id: authorId } });

      if (!userExists) {
        throw new Error("User not found");
      }

      // Comments are only allowed on published posts. A post that exists but
      // is unpublished is reported as "not found", which is the behaviour the
      // in-memory version had (it filtered on `post.published` too).
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post?.published) {
        throw new Error("Post not found");
      }

      const comment = await prisma.comment.create({
        data: {
          text: data.text,
          authorId,
          postId,
        },
      });

      pubsub.publish(`comment ${postId}`, {
        comment: {
          mutation: 'CREATED',
          data: comment
        }
      });
      return comment;
    },

    async updateComment(_parent, args, { prisma, pubsub }) {
        const id = toId(args.id);
        const { data } = args;

        const existing = await prisma.comment.findUnique({ where: { id } });

        if (!existing) throw new Error("Comment not found!");

        const updates = {};

        if (typeof data.text === "string") updates.text = data.text;

        const comment = Object.keys(updates).length === 0
          ? existing
          : await prisma.comment.update({ where: { id }, data: updates });

        pubsub.publish(`comment ${comment.postId}`, {
          comment: {
            mutation: 'UPDATED',
            data: comment
          }
        });

        return comment;
    },

    async deleteComment(_parent, args, { prisma, pubsub }) {
      const id = toId(args.id);

      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) throw new Error("Comment not found!");

      await prisma.comment.delete({ where: { id } });

      pubsub.publish(`comment ${comment.postId}`, {
        comment: {
          mutation: 'DELETED',
          data: comment
        }
      });

      return comment;
    }
}

export default Mutation;
