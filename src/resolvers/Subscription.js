import { toId } from "../utils.js";

const Subscription = {
  comment: {
    // `subscribe` may return a Promise: Yoga awaits it before iterating.
    async subscribe(parent, {postId}, { prisma, pubsub }, info) {
        const id = toId(postId, "postId");

        const post = await prisma.post.findUnique({ where: { id } });

        if(!post || !post.published) {
            throw new Error('Post not found');
        }

      // The channel name must match what Mutation.js publishes. Both sides
      // interpolate the numeric id, so they agree on "comment 10".
      return pubsub.subscribe(`comment ${id}`)
    },
  },
  post: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.subscribe('post')
    },
  },
};

export default Subscription;
