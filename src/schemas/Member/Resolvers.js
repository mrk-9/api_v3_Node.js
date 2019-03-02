const { path } = require('ramda')

const {
  acl,
  ADMIN_ROLE,
  EVENT_PARTNER_ROLE,
  MEMBER_ROLE,
  ANONYMOUS_ROLE
} = require('../AccessControlList')
const {
  ensureProfileOwner,
  withPermissionsAndPrivacy,
  withViewingPermissions,
  authorizeWithSectionScope,
  canSeeMemberId,
  canSeePrivateInfo
} = require('../AccessControlList/conditions')

acl.allow('*', 'Query', 'me')

acl.allow(ANONYMOUS_ROLE, 'Query', 'memberByUid')
acl.deny(ANONYMOUS_ROLE, 'Member', 'id')
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'phoneNumber', withPermissionsAndPrivacy('viewPhonePublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'primaryEmail', withPermissionsAndPrivacy('viewEmailPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'address', withPermissionsAndPrivacy('viewAddressPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'primaryMobile', withPermissionsAndPrivacy('viewMobilePublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'officialAffiliations', withViewingPermissions('viewAffiliationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'officialAwards', withViewingPermissions('viewAwardsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'officialCertifications', withViewingPermissions('viewCertificationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'affiliations', withViewingPermissions('viewAffiliationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'awards', withViewingPermissions('viewAwardsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'certifications', withViewingPermissions('viewCertificationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'personalAffiliations', withViewingPermissions('viewAffiliationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'personalAwards', withViewingPermissions('viewAwardsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'personalCertifications', withViewingPermissions('viewCertificationsPublic'))
acl.addPolicy(ANONYMOUS_ROLE, 'Member', 'expertise', withViewingPermissions('viewExpertisePublic'))

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createMember',
  'deleteMember',
  'updateMember',
  'updateMemberProfile',
  'updateMemberProfileVisibility',
  'updateMemberSocial',
  'updateRole'
])
acl.allow(ADMIN_ROLE, 'Query', [
  'member',
  'memberByUid',
  'members'
])

acl.addPolicy(EVENT_PARTNER_ROLE, 'Query', 'members', authorizeWithSectionScope)
acl.allow(EVENT_PARTNER_ROLE, 'Query', ['member'])

acl.addPolicy(MEMBER_ROLE, 'Mutation', 'updateMember', ensureProfileOwner)
acl.allow(MEMBER_ROLE, 'Mutation', 'updateMemberProfile', ensureProfileOwner)
acl.allow(MEMBER_ROLE, 'Mutation', 'updateMemberProfileVisibility', ensureProfileOwner)
acl.allow(MEMBER_ROLE, 'Mutation', 'updateMemberSocial', ensureProfileOwner)

acl.allow(MEMBER_ROLE, 'Query', [
  'member',
  'memberByUid',
  'members'
])
acl.addPolicy(MEMBER_ROLE, 'Member', 'id', canSeeMemberId)
acl.addPolicy(MEMBER_ROLE, 'Member', 'address', canSeePrivateInfo)
acl.addPolicy(MEMBER_ROLE, 'Member', 'phoneNumber', canSeePrivateInfo)
acl.addPolicy(MEMBER_ROLE, 'Member', 'primaryEmail', canSeePrivateInfo)
acl.addPolicy(MEMBER_ROLE, 'Member', 'primaryMobile', canSeePrivateInfo)

module.exports = {
  Mutation: {
    createMember (rootValue, { input }, context) {
      return context.Member.create(input)
    },

    deleteMember (rootValue, { id }, context) {
      return context.Member.delete(id)
    },

    updateMember (rootValue, { id, input }, context) {
      return context.Member.update(id, input)
    },

    updateMemberProfile (rootValue, { id, uid, input }, context) {
      return context.Pga.updateMemberProfileAttributes(id, uid, input)
    },

    updateMemberProfileVisibility (rootValue, { id, uid, input }, context) {
      return context.Pga.updateMemberProfileVisibility(id, uid, input)
    },

    updateMemberSocial (rootValue, { id, uid, input }, context) {
      return context.Pga.updateMemberProfileSocial(id, uid, input)
    },

    updateRole (rootValue, { id, role }, context) {
      return context.Member.update(id, { role })
    }
  },

  Query: {
    me (rootValue, args, context) {
      return context.user
    },

    member (rootValue, { id }, context) {
      return context.Member.find(id)
    },

    async memberByUid (rootValue, { universalId }, context) {
      const result = await context.Member.findBy({ universalId })
      return path(['edges', '0', 'node'], result)
    },

    members (rootValue, args, context) {
      const { authorization: { scope = {} } } = context
      return context.Member.findBy(scope, args)
    }
  },

  Member: {
    async greenhouseId (member, args, context) {
      if (member.greenhouseId) {
        return member.greenhouseId
      }

      const ghUser = await context.Job.findUserByEmail(member.primaryEmail)
      return ghUser.id ? ghUser.id : null
    },

    primaryFacility (member, args, context) {
      return context.NewFacility.find(member.primaryFacilityUid)
    },

    facilities (member, args, context) {
      return context.NewFacility.findBatch(member.facilityUids)
    },

    section (member, args, context) {
      return context.Section.find(member.sectionId)
    },

    msr (member, args, context) {
      return context.Pga.getMsr(member.id)
    },

    msrStatus (member, args, context) {
      return context.Pga.getMsrStatus(member.id)
    },

    msrHistory (member, args, context) {
      return context.Pga.getMsrHistory(member.id)
    },

    dues (member, args, context) {
      return context.Pga.getDues(member.id)
    },

    role (member) {
      return member.role || MEMBER_ROLE
    },

    myJobs (member, args, context) {
      return context.Job.getJobsPostedBy(member)
    },

    suspended (member) {
      return !!member.suspended
    },

    canBeJuniorLeagueCaptain (member) {
      return ['MB', 'AP', 'ST'].includes(member.type) &&
        member.class !== 'F' && !member.suspended
    }
  }
}
