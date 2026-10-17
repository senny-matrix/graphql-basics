import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

// Create Query definition and resolver for each
//
// title - string - product name
// price - number as float
// releaseYear - number as integer (optional)
// rating - number as float (optional)
// isStock - boolean
//
// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {

  }
`;

// Resolve API
const resolvers = {
  Query: {},
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
