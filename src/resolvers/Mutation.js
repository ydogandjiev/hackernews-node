const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

function createLink(parent, args, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.createLink(
    {
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } }
      }
    },
    info
  )
}

async function updateLink(parent, args, context, info) {
  const userId = getUserId(context)

  const link = await context.db.query.link(
    { where: { id: args.id } },
    `{ postedBy { id } }`
  )
  if (link.postedBy.id !== userId) {
    throw new Error("Cannot update another user's link")
  }

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
}

async function deleteLink(parent, args, context, info) {
  const userId = getUserId(context)

  const link = await context.db.query.link(
    { where: { id: args.id } },
    `{ postedBy { id } votes { id } }`
  )
  if (link.postedBy.id !== userId) {
    throw new Error("Cannot delete another user's link")
  }

  // Delete all votes associated with the link
  await context.db.mutation.deleteManyVotes({ where: { OR: link.votes } })

  // Delete the link
  return context.db.mutation.deleteLink({ where: { id: args.id } }, info)
}

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)

  const user = await context.db.mutation.createUser(
    {
      data: { ...args, password }
    },
    `{ id }`
  )

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user
  }
}

async function login(parent, args, context, info) {
  const user = await context.db.query.user(
    { where: { email: args.email } },
    `{ id password }`
  )
  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user
  }
}

async function vote(parent, args, context, info) {
  const userId = getUserId(context)

  const exists = await context.db.exists.Vote({
    where: {
      user: { id: userId },
      link: { id: args.linkId }
    }
  })
  if (exists) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  return context.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } }
      }
    },
    info
  )
}

module.exports = {
  createLink,
  updateLink,
  deleteLink,
  signup,
  login,
  vote
}
