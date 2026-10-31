import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

//
// Goal | Create input type for createPost and createComment
//
// 1. Create an input type for createPost with the same fields. Use "data" or "post" for arg name.
// 2. Uppdate createPost resolver to use this new object.
// 3. Verify application still works by creating a post and then fetching it.
// 4. Create an input type for createComment with the same fields. Use "data" or "comment" for arg name.
// 5. Update createComment resolver to use this new object.
// 6. Verify application still works by creating a comment and then fetching it.
//
// Demo users data
let users = [
  {
    id: "1",
    name: "Rogers",
    email: "rogers@microskills.ac.tz",
    age: 45,
  },
  {
    id: "2",
    name: "Senny",
    email: "senny@microskills.ac.tz",
  },
  {
    id: "3",
    name: "Kalibwanyigi",
    email: "kali@microskills.ac.tz",
  },
];

let posts = [
  {
    id: "10",
    title: "GraphQL 101",
    body: "This is how you use GraphQL ...",
    published: true,
    author: "1",
  },
  {
    id: "11",
    title: "GraphQL 201",
    body: "This is how you use an advanced GraphQL ...",
    published: false,
    author: "1",
  },
  {
    id: "12",
    title: "Programming music 101",
    body: "This is how you program music ...",
    published: true,
    author: "2",
  },
];

let comments = [
  {
    id: "102",
    text: "This worked well for me! Thanks.",
    author: "3",
    post: "10",
  },
  {
    id: "103",
    text: "Glad you enjoyed it.",
    author: "1",
    post: "10",
  },
  {
    id: "104",
    text: "This did not work",
    author: "2",
    post: "11",
  },
  {
    id: "105",
    text: "Never mind, I got it to work",
    author: "1",
    post: "11",
  },
];

// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    me: User!
    post: Post!
  }

  type Mutation {
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

// Resolve API
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (!args.query) return posts;
      return posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());

        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());

        return isTitleMatch || isBodyMatch;
      });
    },
    comments: (parent, args, ctx, info) => {
      return comments;
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
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => {
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
      users.push(user);
      return user;
    },

    deleteUser(parent, args, ctx, info){
      const userIndex = users.findIndex((user) => {
        return user.id === args.id;
      });

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);

      posts = posts.filter((post) => {
        const match = post.author === args.id;
        if (match){
          comments = comments.filter((comment) => {
            return comment.post !== post.id
          });
        }
        return !match
      });

      comments = comments.filter((comment) => comment.author !== args.id);
      return deletedUser;
    },

    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => {
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
      posts.push(post);
      return post;
    },

    deletePost(parent, args, ctx, info) {
      // Check if the Post exists
      const postIndex = posts.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error("Post not found!");

      const [deletedPost] = posts.splice(postIndex, 1);

      comments = comments.filter((comment) => comment.post !== args.id);
      return deletedPost;
    },

    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => {
        return user.id === args.data.author;
      });

      if (!userExists) {
        throw new Error("User not found");
      }

      const postExists = posts.some((post) => {
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
      comments.push(comment);
      return comment;
    },

    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex((comment) => comment.id === args.id);

      if (commentIndex === -1) throw new Error("Comment not found!");

      const [deletedComment] = comments.splice(commentIndex, 1);

      return deletedComment;
    }
    
  },
  
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      });
    },
    
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
