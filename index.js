import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types in GraphQL are 
// String
// Boolean
// Int
// Float
// ID

// Type definitions (Schema)
const typeDefs = /* GraphQL */ `
  type Query {
    id: ID!
    name: String!
    age: Int!
    employed: Boolean!
    gpa: Float
  }
`;

// Resolve API
const resolvers = {
  Query: {
    id: () => 'abc-123',
    name: () => 'Rogers',
    age: () => 30,
    employed: () => true,
    gpa: () => 3.5,
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
