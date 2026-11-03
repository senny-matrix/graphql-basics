import { randomUUID } from "node:crypto";

const Mutation = {
    createUser(parent, args, {db}, info) {
      const emailTaken = db.users.some((user) => {
        return user.email === args.data.email;
      });

      if (emailTaken) {
        throw new Error("Email already taken");
      }
      
      const id = randomUUID();
      const user = {
        id,
        ...args.data,
      };
      db.users.push(user);
      return user;
    },

    updateUser(parent, args, {db}, info) {
        const { id, data } = args;
        const user = db.users.find((user) => user.id === id);

        if (!user) throw new Error("User not found");

        if (typeof data.email === "string") {
            const emailTaken = db.users.some((user) => {
                return user.email === data.email && user.id !== id;
            });

            if (emailTaken) throw new Error("Email already taken");
            user.email = data.email;
        }

        if (typeof data.name === "string") user.name = data.name;

        if (typeof data.age !== "undefined") user.age = data.age;

        return user;
    },

    deleteUser(parent, args, {db}, info) {
      const userIndex = db.users.findIndex((user) => {
        return user.id === args.id;
      });

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const deletedUser = db.users[userIndex];
      db.users.splice(userIndex, 1);

      db.posts = db.posts.filter((post) => {
        const match = post.author === args.id;
        if (match){
          db.comments = db.comments.filter((comment) => {
            return comment.post !== post.id
          });
        }
        return !match
      });

      db.comments = db.comments.filter((comment) => comment.author !== args.id);
      return deletedUser;
    },

    createPost(parent, args, {db, pubsub}, info) {
      const userExists = db.users.some((user) => {
        return user.id === args.data.author;
      });

      if (!userExists) {
        throw new Error("Author not found");
      }
      
      const id = randomUUID();
      const post = {
        id,
        ...args.data,
      };
      db.posts.push(post);
      if (args.data.published) {
        pubsub.publish('post', {
          post: {
          mutation: 'CREATED',
          data: post
          }
        })
      }
      return post;
    },

    updatePost(parent, args, {db, pubsub}, info) {
        const { id, data } = args;
        const post = db.posts.find((post) => post.id === id);
        const originalPost = {...post};

        if (!post) throw new Error("Post not found!");

        if (typeof data.author === "string") {
            const userExists = db.users.some((user) => user.id === data.author);

            if (!userExists) throw new Error("Author not found");
            post.author = data.author;
        }

        if (typeof data.title === "string") post.title = data.title;

        if (typeof data.body === "string") post.body = data.body;

        if (typeof data.published === "boolean") {

          post.published = data.published;

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
          }
        }else if (data.published){
          // update
          pubsub.publish('post', {
            post: {
              mutation: 'UPDATED',
              data: post
            }
          })
        }
        return post;
    },

    deletePost(parent, args, {db, pubsub}, info) {
      // Check if the Post exists
      const postIndex = db.posts.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error("Post not found!");

      const [deletedPost] = db.posts.splice(postIndex, 1);

      db.comments = db.comments.filter((comment) => comment.post !== args.id);

      if(deletedPost.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: deletedPost
          }
        })
      }

      return deletedPost;
    },

    createComment(parent, args, {db, pubsub}, info) {
      const userExists = db.users.some((user) => {
        return user.id === args.data.author;
      });

      if (!userExists) {
        throw new Error("User not found");
      }

      const postExists = db.posts.some((post) => {
        return post.id === args.data.post && post.published;
      });

      if (!postExists) {
        throw new Error("Post not found");
      }
      
      const id = randomUUID();
      const comment = {
        id,
        ...args.data,
      };
      db.comments.push(comment);
      pubsub.publish(`comment ${args.data.post}`, {comment});
      return comment;
    },

    updateComment(parent, args, {db}, info) {
        const { id, data } = args;
        const comment = db.comments.find((comment) => comment.id === id);

        if (!comment) throw new Error("Comment not found!");

        if (typeof data.text === "string") comment.text = data.text;

        return comment;
    },

    deleteComment(parent, args, {db}, info) {
      const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

      if (commentIndex === -1) throw new Error("Comment not found!");

      const [deletedComment] = db.comments.splice(commentIndex, 1);

      return deletedComment;
    }
}

export default Mutation;