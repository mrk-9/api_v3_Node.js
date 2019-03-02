const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createPartner',
  'updatePartner',
  'deletePartner'
])

acl.allow(ADMIN_ROLE, 'Query', [
  'partner',
  'partners'
])

module.exports = {
  Mutation: {
    createPartner (rootValue, { input }, context) {
      return context.Partner.create(input)
    },

    updatePartner (rootValue, { id, input }, context) {
      return context.Partner.update(id, input)
    },

    deletePartner (rootValue, { id }, context) {
      return context.Partner.delete(id)
    }
  },

  Query: {
    partner (rootValue, { id }, context) {
      return context.Partner.find(id)
    },

    partners (rootValue, { first, after }, context) {
      return context.Partner.list({ first, after })
    }
  },

  Partner: {
    section (partner, args, context) {
      return context.Section.find(partner.sectionId)
    }
  }
}
