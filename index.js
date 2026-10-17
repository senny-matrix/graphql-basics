import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
    name: String!
    location: String!
    bio: String
  }
`;

// Resolve API
const resolvers = {
  Query: {
    hello: () => 'Hello World, this is my first query',
    name: () => 'My name is Rogers',
    location: () => 'I am based in Tanzania',
    bio: () => 'I am a software engineer'
  }
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers })
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
