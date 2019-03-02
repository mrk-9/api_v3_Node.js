const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Query', [
  'journals'
])

module.exports = {
  Query: {
    journals (rootValue, { first, after }, context) {
      return context.Journal.list({ first, after })
    }
  }
}
