const {
  acl,
  MEMBER_ROLE,
  ADMIN_ROLE
} = require('../AccessControlList')
const { ensureProfileOwner } = require('../AccessControlList/conditions')

acl.addPolicy(MEMBER_ROLE, 'Mutation', 'register', ensureProfileOwner)
acl.allow(ADMIN_ROLE, 'Mutation', 'register')

module.exports = {
  Mutation: {
    async register (rootValue, { id, productCode }, context) {
      return context.Pga.register(id, productCode)
    }
  }
}
