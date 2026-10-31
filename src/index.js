import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import db from './db.js';


// Resolve API
const resolvers = {
  Query: {

    users(parent, args, {db}, info) {
      if (!args.query) {
        return db.users;
      }

      return db.users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, {db}, info) {
      if (!args.query) return db.posts;
      return db.posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());

        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());

        return isTitleMatch || isBodyMatch;
      });
    },
    comments: (parent, args, {db}, info) => {
      return db.comments;
    },
    me() {
      return {
        id: "123-abc",
        name: "Rogers Aaron",
        email: "rogers@microskills.ac.tz",
        age: 39,
      };
    },
    post() {
      return {
        id: "345-abc",
        title: "GraphQL 101",
        body: "A training about GraphQL for beginners",
        published: false,
        author: "1",
      };
    },
  },

  Mutation: {
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
    
  },
  
  Post: {
    author(parent, args, {db}, info) {
      return db.users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, {db}, info) {
      return db.comments.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, {db}, info) {
      return db.users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, {db}, info) {
      return db.posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    posts(parent, args, {db}, info) {
      return db.posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, {db}, info) {
      return db.comments.filter((comment) => {
        return comment.author === parent.id;
      });
    },
    
  },
};

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: () => ({ db }),
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
