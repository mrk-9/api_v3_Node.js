const { path } = require('ramda')

const { acl, ADMIN_ROLE } = require('../AccessControlList')
const getStateSections = require('./getStateSections')

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createSection',
  'deleteSection',
  'updateSection'
])

acl.allow('*', 'Query', [
  'section',
  'sections',
  'stateSections'
])

module.exports = {
  Mutation: {
    createSection (rootValue, { input }, context) {
      return context.Section.create(input)
    },

    updateSection (rootValue, { id, input }, context) {
      return context.Section.update(id, input)
    },

    deleteSection (rootValue, { id }, context) {
      return context.Section.delete(id)
    }
  },

  Query: {
    section (rootValue, { id }, context) {
      return context.Section.find(id)
    },

    sections (rootValue, args, context) {
      return context.Section.list(args)
    },

    stateSections (rootValue, { state }, context) {
      const sectionIds = getStateSections(state)
      return context.Section.findBatch(sectionIds)
    }
  },

  Section: {
    events (section, args, context) {
      return context.Event.findBy({ sectionId: section.id }, args)
    },

    paymentTypes (section, args, context) {
      return context.PaymentType.findBy({ sectionId: section.id }, args)
    },

    async primaryFacility (section, args, context) {
      const res = await context.NewFacility.findBy({ facilityId: section.id })
      return path(['edges', '0', 'node'], res)
    }
  }
}
