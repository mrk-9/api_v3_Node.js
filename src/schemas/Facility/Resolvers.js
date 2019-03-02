const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', ['createFacility', 'deleteFacility', 'updateFacility'])

acl.allow('*', 'Query', ['facility', 'facilities'])

module.exports = {
  Mutation: {
    createFacility (rootValue, { input }, context) {
      return context.Facility.create(input)
    },

    updateFacility (rootValue, { id, input }, context) {
      return context.Facility.update(id, input)
    },

    deleteFacility (rootValue, { id }, context) {
      return context.Facility.delete(id)
    }
  },

  Query: {
    facility (rootValue, { id }, context) {
      return context.NewFacility.find(id)
    },

    facilities (rootValue, args, context) {
      return context.NewFacility.list(args)
    }
  },

  Facility: {
    section (facility, args, context) {
      return context.Section.find(facility.sectionId)
    }
  }
}
