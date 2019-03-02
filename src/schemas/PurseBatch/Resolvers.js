const { acl, ADMIN_ROLE, EVENT_PARTNER_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', ['createPurseBatch'])

acl.allow(EVENT_PARTNER_ROLE, 'Mutation', ['createPurseBatch'])

acl.allow('*', 'Query', 'checkEventPlayer')

module.exports = {
  Mutation: {
    async createPurseBatch (rootValue, { input }, context) {
      return context.PurseBatch.create(input)
    }
  },

  Query: {
    async checkEventPlayer (rootValue, { input }, context) {
      return context.PurseBatch.checkEventPlayer(input)
    }
  },

  PurseBatch: {
    event (purseBatch, args, context) {
      return context.Event.find(purseBatch.eventId)
    }
  }
}
