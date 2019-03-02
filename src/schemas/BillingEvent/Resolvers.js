const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Query', [
  'billingEvents'
])

module.exports = {
  Query: {
    billingEvents (rootValue, { first, after }, context) {
      return context.BillingEvent.list({ first, after })
    }
  }
}
