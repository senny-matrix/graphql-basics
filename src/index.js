
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createSchema, createYoga, createPubSub } from "graphql-yoga";
import db from './db.js';
import Comment from "./resolvers/Comment.js";
import Mutation from "./resolvers/Mutation.js";
import Post from "./resolvers/Post.js";
import Query from "./resolvers/Query.js";
import Subscription from "./resolvers/Subscription.js";
import User from "./resolvers/User.js";

const pubsub = createPubSub();
// Resolve API
const resolvers = {
  Comment,
  Mutation,
  Post,
  Query,
  Subscription,
  User
};

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: () => ({ db, pubsub }),
});

const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
