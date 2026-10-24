import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

// Your challenge
// 1. Set up an array of three posts with dummy post data (id, title, body, published)
//
// 2. Set up a "posts" query and receiver that returns all the posts
//
// 3. Test the query out
//
// 4. Add a query argument that only returns posts that contains that query string in the title or body
//
// 5. Run a few sample queries searching for posts with a specific title
//

// Demo users data
const users = [
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

const posts = [
  {
    id: "10",
    title: "GraphQL 101",
    body: "This is how you use GraphQL ...",
    published: true,
  },
  {
    id: "11",
    title: "GraphQL 201",
    body: "This is how you use an advanced GraphQL ...",
    published: false,
  },
  {
    id: "12",
    title: "Programming music 101",
    body: "This is how you program music ...",
    published: true,
  },
];
// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    users(query: String): [User!]!
    posts: [Post!]!
    me: User!
    post: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
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
      return posts;
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
      };
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
