const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const AuthPayload = require('./resolvers/AuthPayload')
const Subscription = require('./resolvers/Subscription')
const Feed = require('./resolvers/Feed')

/*
const resolvers = {
  Query: {
    info: () => `This is the API of Hackernews Clone`,
    feed: (root, args, context, info) => {
      return context.db.query.links({}, info)
    }
  },
  Mutation: {
    createLink: (root, args, context, info) => {
      return context.db.mutation.createLink(
        {
          data: {
            url: args.url,
            description: args.description
          }
        },
        info
      )
    },
    updateLink: (root, args, context, info) => {
      return context.db.mutation.updateLink(
        {
          where: {
            id: args.id
          },
          data: {
            url: args.url,
            description: args.description
          }
        },
        info
      )
    },
    deleteLink: (root, args, context, info) => {
      return context.db.mutation.deleteLink(
        {
          where: {
            id: args.id
          }
        },
        info
      )
    }
  }
}
*/

const resolvers = {
  Query,
  Mutation,
  AuthPayload,
  Subscription,
  Feed
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: './src/generated/prisma.graphql',
      endpoint:
        'https://us1.prisma.sh/public-quillcrow-787/hackernews-node/dev',
      secret: 'mysecret123',
      debug: true
    })
  })
})
server.start(() => console.log(`Server is running on http://localhost:4000`))
