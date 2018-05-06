const { GraphQLServer } = require('graphql-yoga')

let links = [
  {
    id: 'link-0',
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL'
  }
]

let idCount = links.length

const resolvers = {
  Query: {
    info: () => `This is the API of Hackernews Clone`,
    feed: () => links
  },
  Mutation: {
    createLink: (root, args) => {
      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url
      }
      links.push(link)
      return link
    },
    updateLink: (root, args) => {
      for (let i = 0; i < links.length; i++) {
        if (links[i].id === args.id) {
          links[i].description = args.description
          links[i].url = args.url
          return links[i]
        }
      }
    },
    deleteLink: (root, args) => {
      let index = links.findIndex(link => link.id === args.id)
      if (index >= 0) {
        return links.splice(index, 1)[0]
      }
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers
})
server.start(() => console.log(`Server is running on http://localhost:4000`))
