const { acl, ADMIN_ROLE, EVENT_PARTNER_ROLE, MEMBER_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', ['createEvent', 'deleteEvent', 'updateEvent'])
acl.allow(ADMIN_ROLE, 'Query', ['event', 'events'])

acl.allow(EVENT_PARTNER_ROLE, 'Query', ['event', 'events'])

acl.allow(MEMBER_ROLE, 'Query', ['event', 'events'])

module.exports = {
  Mutation: {
    async createEvent (rootValue, { input }, context) {
      const section = await context.Section.find(input.sectionId)

      if (!section) {
        throw new Error(`Invalid section ID '${input.sectionId}'!`)
      }

      const inputWithSection = { sectionId: section.sectionId, ...input }
      return context.Event.create(inputWithSection)
    },

    updateEvent (rootValue, { id, input }, context) {
      return context.Event.update(id, input)
    },

    deleteEvent (rootValue, { id }, context) {
      return context.Event.delete(id)
    }
  },

  Query: {
    event (rootValue, { id }, context) {
      return context.Event.find(id)
    },

    events (rootValue, args, context) {
      return context.Event.list(args)
    }
  },

  Event: {
    section (event, args, context) {
      return context.Section.find(event.sectionId)
    },

    products (event, args, context) {
      return context.Product.findBy({ eventId: event.id }, args)
    },

    closed (event, args, context) {
      return !!event.closed
    }
  }
}
