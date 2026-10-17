import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

// 1. Create an add query that returns a float
// 2. Setup add to take two arguments (a, b) which are required floats
// 3. Have the resolver send back the sum of two arguments

// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    add(a: Float!, b: Float!): Float!
    greeting(name: String): String!
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
    add(parent, args, ctx, info) {
      return args.a + args.b;
    },
    greeting(parent, args, ctx, info) {
      if (args.name) {
        return `Hello ${args.name}!`;
      } else {
        return `Hello!`;
      }
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
