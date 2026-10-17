import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    title: String!
    price: Float!
    releaseYear: Int!
    rating: Float
    inStock: Boolean!
  }
`;

// Resolve API
const resolvers = {
  Query: {
    title() {
      return `The Art of War`;
    },
    price: () => 12.9,
    releaseYear: () => null,
    rating: () => 5,
  },
  inStock: true,
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
