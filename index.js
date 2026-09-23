
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// 1. Define the fields that the API can return.
const typeDefs = `#graphql
  type Claim {
    dcn: ID!
    memberId: String!
    status: String!
    receivedDate: String!
  }

  type Query {
    getDCNNumbers: [Claim!]!
    getClaim(dcn: ID!): Claim
  }
`;

// 2. Create sample data.
// All values are fictional.
const claims = [
  {
    dcn: "DCN10001",
    memberId: "TEST001",
    status: "RECEIVED",
    receivedDate: "2026-09-21"
  },
  {
    dcn: "DCN10002",
    memberId: "TEST002",
    status: "PENDING",
    receivedDate: "2026-09-22"
  },
  {
    dcn: "DCN10003",
    memberId: "TEST003",
    status: "RECEIVED",
    receivedDate: "2026-09-23"
  }
];

// 3. Return data when someone calls the API.
const resolvers = {
  Query: {
    getDCNNumbers: () => claims,
    getClaim: (_, { dcn }) =>
      claims.find(claim => claim.dcn === dcn) ?? null
  }
};

// 4. Start the GraphQL server.
const server = new ApolloServer({
  typeDefs,
  resolvers
});

const port = Number(process.env.PORT || 4000);

const { url } = await startStandaloneServer(server, {
  listen: {
    port,
    host: "0.0.0.0"
  }
});

console.log(`GraphQL API running at ${url}`);
