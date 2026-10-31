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

        if(typeof data.email === 'string'){
            const emailTaken = db.users.some((user) => user.email === data.email);
            if (emailTaken) throw new Error("Email already taken");
        }

        if(typeof data.name === "string") user.name = data.name;
        user.email = data.email;

        if(typeof data.age !== 'undefined') user.age = data.age;
        
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

    createPost(parent, args, {db}, info) {
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
      return post;
    },

    deletePost(parent, args, {db}, info) {
      // Check if the Post exists
      const postIndex = db.posts.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error("Post not found!");

      const [deletedPost] = db.posts.splice(postIndex, 1);

      db.comments = db.comments.filter((comment) => comment.post !== args.id);
      return deletedPost;
    },

    createComment(parent, args, {db}, info) {
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