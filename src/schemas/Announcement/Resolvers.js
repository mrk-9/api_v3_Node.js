const { acl, ADMIN_ROLE, MEMBER_ROLE, NON_MEMBER_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Query', ['announcements'])

acl.allow(MEMBER_ROLE, 'Query', ['announcements'])

acl.allow(NON_MEMBER_ROLE, 'Query', ['announcements'])

module.exports = {
  Query: {
    announcements (rootValue, args, context) {
      return context.Announcement.findBy(args)
    }
  }
}
