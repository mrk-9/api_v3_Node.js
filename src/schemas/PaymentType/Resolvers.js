const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createPaymentType',
  'updatePaymentType',
  'deletePaymentType'
])

acl.allow(ADMIN_ROLE, 'Query', [
  'paymentType',
  'paymentTypes'
])

module.exports = {
  Mutation: {
    createPaymentType (rootValue, { input }, context) {
      return context.PaymentType.create(input)
    },

    updatePaymentType (rootValue, { id, input }, context) {
      return context.PaymentType.update(id, input)
    },

    deletePaymentType (rootValue, { id }, context) {
      return context.PaymentType.delete(id)
    }
  },

  Query: {
    paymentType (rootValue, { id }, context) {
      return context.PaymentType.find(id)
    },

    paymentTypes (rootValue, args, context) {
      return context.PaymentType.list(args)
    }
  },

  PaymentType: {
    section (paymentType, args, context) {
      return context.Section.find(paymentType.sectionId)
    }
  }
}
