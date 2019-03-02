const casual = require('casual')
const { GraphQLError } = require('graphql')

const { Member } = require('../../factory/Member')
const { EXPECTED_JOB } = require('../../factory/Job')

const { ADMIN_ROLE, MEMBER_ROLE, ANONYMOUS_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const USER_ID = '7657657'
const INPUT = Member({ id: USER_ID })
const msrCredits = [{
  required: casual.integer(1, 25),
  label: 'PGA Required',
  earned: casual.integer(1, 25)
}, {
  required: casual.integer(1, 25),
  label: 'Total MSR Required',
  earned: casual.integer(1, 25)
}]

const EXPECTED = {
  id: INPUT.id,
  class: INPUT.class,
  type: INPUT.type,
  firstName: INPUT.firstName,
  lastName: INPUT.lastName,
  section: { id: INPUT.sectionId },
  greenhouseId: INPUT.greenhouseId,
  universalId: INPUT.universalId,
  birthdate: INPUT.birthdate,
  masterProfessional: INPUT.masterProfessional,
  primaryMobile: INPUT.primaryMobile,
  publicMobile: INPUT.publicMobile,
  phoneNumber: INPUT.phoneNumber,
  publicPhone: INPUT.publicPhone,
  displayName: INPUT.displayName,
  gender: INPUT.gender,
  suspended: INPUT.suspended,
  role: MEMBER_ROLE,
  primaryFacility: { id: INPUT.primaryFacilityUid },
  facilities: [{ id: INPUT.primaryFacilityUid }],
  publicEmail: INPUT.publicEmail,
  primaryEmail: INPUT.primaryEmail,
  memberClassDescription: INPUT.memberClassDescription,
  address: INPUT.address,
  education: INPUT.education,
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z',
  msr: msrCredits,
  msrStatus: {
    cycle: {
      cohortCode: 'A',
      cycleCode: '16',
      endDate: '2021-06-15T00:00:00.000Z',
      pdpSerial: 1184120,
      startDate: '2018-06-16T00:00:00.000Z'
    },
    credits: msrCredits
  },
  msrHistory: [{
    category: 'ED',
    addedDate: '2018-07-04',
    activityCode: 'M14',
    creditsAccepted: 1,
    creditsAppliedFor: 1,
    description1: 'Capital budgeting and decision making',
    type: 'Member Service Requirement',
    description2: 'More description here'
  }],
  dues: [{
    duesBalance: '10.00',
    dueDate: '2017-06-30T04:00:00.000Z'
  }],
  overview: INPUT.overview,
  viewingPermissions: INPUT.viewingPermissions,
  personalAffiliations: INPUT.personalAffiliations,
  personalAwards: INPUT.personalAwards,
  personalCertifications: INPUT.personalCertifications,
  expertise: INPUT.expertise,
  social: INPUT.social,
  officialCertifications: INPUT.officialCertifications,
  officialAwards: INPUT.officialAwards,
  certifications: INPUT.certifications,
  awards: INPUT.awards
}

const jlMemberType = casual.random_element(['MB', 'AP', 'ST'])

const JL_CAPTAIN_EXPECTED = {
  id: INPUT.id,
  class: 'A1',
  type: jlMemberType,
  suspended: false,
  canBeJuniorLeagueCaptain: true
}

const JL_CAPTAIN_SUSPENDED = {
  id: INPUT.id,
  class: 'A1',
  type: jlMemberType,
  suspended: null,
  canBeJuniorLeagueCaptain: true
}

const JL_CAPTAIN_SUSPENDED_EXPECTED = {
  id: INPUT.id,
  class: 'A1',
  type: jlMemberType,
  suspended: false,
  canBeJuniorLeagueCaptain: true
}

const JL_CAPTAIN_CLASS_EXPECTED = {
  id: INPUT.id,
  class: 'F',
  type: 'MB',
  suspended: false,
  canBeJuniorLeagueCaptain: false
}

const ME_DUES_EXPECTED = {
  id: INPUT.id,
  type: 'ST',
  dues: [{
    duesBalance: '10.00',
    dueDate: null
  }]
}

const MEMBER_A3_CLASS_EXPECTED = {
  id: INPUT.id,
  class: 'A3',
  address: INPUT.address,
  phoneNumber: INPUT.phoneNumber,
  primaryEmail: INPUT.primaryEmail
}

const ME_ANONYMOUS_EXPECTED = {
  id: INPUT.id,
  primaryMobile: INPUT.primaryMobile,
  primaryEmail: INPUT.primaryEmail,
  viewingPermissions: {
    viewEmailPublic: false,
    viewMobilePublic: false
  }
}

const Pga = {
  getMsr: () => Promise.resolve(EXPECTED.msr),
  getMsrStatus: () => Promise.resolve(EXPECTED.msrStatus),
  getDues: () => Promise.resolve(EXPECTED.dues),
  getMsrHistory: () => Promise.resolve(EXPECTED.msrHistory)
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED, role = ADMIN_ROLE, id = USER_ID, userData = {}) => ({
  user: { role, id, ...userData },
  Member: { [methodName]: () => Promise.resolve(returnValue) },
  Section: { find: () => Promise.resolve(EXPECTED.section) },
  NewFacility: {
    find: () => Promise.resolve(EXPECTED.primaryFacility),
    findBatch: () => Promise.resolve(EXPECTED.facilities)
  },
  Pga
})

test('me', () => {
  return testSchemaQuery('me', {
    context: {
      user: { ...ME_DUES_EXPECTED, role: ADMIN_ROLE },
      Pga: {
        getMsr: () => Promise.resolve(EXPECTED.msr),
        getDues: () => Promise.resolve([{
          duesBalance: '10.00',
          dueDate: null
        }])
      }
    },
    expected: ME_DUES_EXPECTED
  })
})

test('create member', () => {
  return testSchemaMutation('createMember', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('member update member', () => {
  return testSchemaMutation('updateMember', {
    context: contextWithMethodMock('update', EXPECTED, MEMBER_ROLE),
    variables: { id: USER_ID, input: INPUT },
    expected: EXPECTED
  })
})

test('admin update member', () => {
  return testSchemaMutation('updateMember', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('admin update role', () => {
  return testSchemaMutation('updateRole', {
    context: contextWithMethodMock('update', EXPECTED, ADMIN_ROLE),
    variables: { id: USER_ID, role: ADMIN_ROLE },
    expected: EXPECTED
  })
})

test('member update role', () => {
  return testSchemaMutation('updateRole', {
    context: contextWithMethodMock('update', EXPECTED, MEMBER_ROLE),
    variables: { id: USER_ID, role: ADMIN_ROLE },
    fields: 'id',
    expected: {
      data: { updateRole: null },
      errors: [new GraphQLError(`'MEMBER' is not authorized to access 'Mutation.updateRole'`)]
    }
  })
})

test('delete member', () => {
  return testSchemaMutation('deleteMember', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('me', () => {
  return testSchemaQuery('me', {
    context: {
      user: EXPECTED,
      Section: { find: () => Promise.resolve(EXPECTED.section) },
      NewFacility: {
        find: () => Promise.resolve(EXPECTED.primaryFacility),
        findBatch: () => Promise.resolve(EXPECTED.facilities)
      },
      Pga
    },
    expected: EXPECTED
  })
})

test('find member', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('member JL captain eligibility', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find', JL_CAPTAIN_EXPECTED),
    variables: { id: 'id' },
    expected: JL_CAPTAIN_EXPECTED
  })
})

test('class JL captain eligibility', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find', JL_CAPTAIN_CLASS_EXPECTED),
    variables: { id: 'id' },
    expected: JL_CAPTAIN_CLASS_EXPECTED
  })
})

test('suspended JL captain eligibility', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find', JL_CAPTAIN_SUSPENDED),
    variables: { id: 'id' },
    expected: JL_CAPTAIN_SUSPENDED_EXPECTED
  })
})

test('A3 member visible fields', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find', MEMBER_A3_CLASS_EXPECTED, MEMBER_ROLE, '5388PGA'),
    variables: { id: 'id' },
    expected: {
      returnData: {
        address: null,
        phoneNumber: null,
        primaryEmail: null,
        primaryMobile: null
      },
      errors: [
        new GraphQLError(`'MEMBER' is not authorized to access 'Member.address'`),
        new GraphQLError(`'MEMBER' is not authorized to access 'Member.phoneNumber'`),
        new GraphQLError(`'MEMBER' is not authorized to access 'Member.primaryEmail'`),
        new GraphQLError(`'MEMBER' is not authorized to access 'Member.primaryMobile'`)
      ]
    },
    fields: 'address { address1 } phoneNumber primaryEmail primaryMobile'
  })
})

test('find member by universal ID', () => {
  return testSchemaQuery('memberByUid', {
    context: contextWithMethodMock('findBy', connectionWrap(MEMBER_A3_CLASS_EXPECTED), ANONYMOUS_ROLE),
    variables: { universalId: 'id' },
    expected: {
      returnData: {
        address: null,
        phoneNumber: null,
        primaryEmail: null,
        primaryMobile: null
      },
      errors: [
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.address'`),
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.phoneNumber'`),
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.primaryEmail'`),
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.primaryMobile'`)
      ]
    },
    fields: 'address { address1 } phoneNumber primaryEmail primaryMobile'
  })
})

test('me a3 class fields visibility', () => {
  return testSchemaQuery('me', {
    context: {
      user: { ...MEMBER_A3_CLASS_EXPECTED, role: MEMBER_ROLE }
    },
    expected: MEMBER_A3_CLASS_EXPECTED
  })
})

test('anonymous find member by universal ID', () => {
  return testSchemaQuery('memberByUid', {
    context: contextWithMethodMock('findBy', connectionWrap(ME_ANONYMOUS_EXPECTED), ANONYMOUS_ROLE),
    variables: { universalId: 'id' },
    expected: {
      errors: [
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.primaryEmail'`),
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.primaryMobile'`),
        new GraphQLError(`'ANONYMOUS' is not authorized to access 'Member.id'`)
      ]
    },
    fields: 'id primaryEmail primaryMobile'
  })
})

test('member find member by id', () => {
  return testSchemaQuery('member', {
    context: contextWithMethodMock('find', EXPECTED, MEMBER_ROLE, '5388PGA'),
    variables: { id: 'id' },
    expected: {
      errors: [
        new GraphQLError(`'MEMBER' is not authorized to access 'Member.id'`)
      ]
    },
    fields: 'id'
  })
})

const expectedConnection = connectionWrap(EXPECTED)
test('find member by universal ID', () => {
  return testSchemaQuery('memberByUid', {
    context: contextWithMethodMock('findBy', expectedConnection),
    variables: { universalId: INPUT.universalId },
    expected: EXPECTED
  })
})

test('list members', () => {
  return testSchemaQuery('members', {
    context: contextWithMethodMock('findBy', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})

test('get member posted jobs', () => {
  return testSchemaQuery('me', {
    context: {
      user: EXPECTED,
      Job: { getJobsPostedBy: jest.fn().mockResolvedValue([EXPECTED_JOB]) }
    },
    expected: { myJobs: [EXPECTED_JOB] }
  })
})
