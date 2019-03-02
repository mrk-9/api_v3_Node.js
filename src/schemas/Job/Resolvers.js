const { path } = require('ramda')
const { ensureEmailOwner, ensureGreenhouseIdOwner } = require('../AccessControlList/conditions')
const { acl, ADMIN_ROLE, MEMBER_ROLE, NON_MEMBER_ROLE } = require('../AccessControlList')

acl.allow('*', 'Mutation', 'createJobApplication')
acl.allow('*', 'Query', [
  'job',
  'jobCustomFields',
  'jobPermissions'
])

acl.allow(ADMIN_ROLE, 'Query', ['jobsByGreenhouseUserId'])
acl.addPolicy(MEMBER_ROLE, 'Query', ['jobsByGreenhouseUserId'], ensureGreenhouseIdOwner)
acl.addPolicy(NON_MEMBER_ROLE, 'Query', ['jobsByGreenhouseUserId'], ensureGreenhouseIdOwner)

acl.addPolicy(MEMBER_ROLE, 'Mutation', 'createUser', ensureEmailOwner)
acl.addPolicy(NON_MEMBER_ROLE, 'Mutation', 'createUser', ensureEmailOwner)

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createJob',
  'updateJob',
  'duplicateJob',
  'createJobPermission',
  'createUser'
])

acl.allow(MEMBER_ROLE, 'Mutation', [
  'createJob',
  'updateJob',
  'duplicateJob',
  'createJobPermission'
])

acl.allow(NON_MEMBER_ROLE, 'Mutation', [
  'createJob',
  'updateJob',
  'duplicateJob',
  'createJobPermission'
])

module.exports = {
  Mutation: {
    createJob (rootValue, { input }, context) {
      return context.Job.create(input)
    },

    createJobApplication (rootValue, { input }, context) {
      return context.JobApplication.create(input)
    },

    updateJob (rootValue, { id, input }, context) {
      return context.Job.update(id, input)
    },

    duplicateJob (rootValue, { id, jobTitle }, context) {
      return context.Job.duplicate(id, jobTitle)
    },

    async createJobPermission (rootValue, { facilityId, greenhouseId }, context) {
      const userGreenhouseId = context.user.greenhouseId || greenhouseId
      const { edges: [ response = {} ] } = await context.NewFacility.findBy({ facilityId }) || {}
      const { node: { greenhouseId: facilityGreenhouseId } = {} } = response
      if (!facilityGreenhouseId) {
        throw new Error('Facility ID does not exist')
      }
      return context.Job.createJobPermission(userGreenhouseId, facilityGreenhouseId)
    },

    createUser (rootValue, { input }, context) {
      return context.Job.createUser(input)
    }
  },

  Query: {
    job (rootValue, { id }, context) {
      return context.Job.find(id)
    },

    jobCustomFields (rootValue, args, context) {
      return context.Job.getCustomFields()
    },

    jobPermissions (rootValue, { greenhouseId }, context) {
      return context.Job.getJobPermissions(greenhouseId)
    },

    jobsByGreenhouseUserId (rootValue, args, context) {
      return context.Job.getJobsPostedBy(args)
    }
  },

  Job: {
    facilities (job, args, context) {
      return job.offices
        .filter(office => office.id)
        .map(async office => {
          const facility = await context.NewFacility.findBy({ greenhouseId: office.id.toString() })
          return path(['edges', '0', 'node'], facility)
        })
    }
  },

  JobPermissions: {
    async facilityName (jobPermissions, args, context) {
      const greenhouseId = jobPermissions.officeId.toString()
      const facility = await context.NewFacility.findBy({ greenhouseId })

      return path(['edges', '0', 'node', 'name'], facility)
    }
  }
}
