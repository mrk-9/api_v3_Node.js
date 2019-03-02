const { ANONYMOUS_ROLE, ADMIN_ROLE } = require('../AccessControlList')
const { testSchemaQuery, testSchemaMutation } = require('../SchemaTester')
const {
  EXPECTED_JOB,
  EXPECTED_JOB_APPLICATION,
  EXPECTED_JOB_FACILITY
} = require('../../factory/Job')
const EXPECTED_UPDATED_JOB = require('./__data__/updateJob.json')
const EXPECTED_DUPLICATED_JOB = require('./__data__/duplicateJob.json')

const EXPECTED_CUSTOM_FIELDS = {
  id: '0',
  name: 'custom field',
  active: true,
  fieldType: 'field type',
  priority: 4,
  valueType: 'value',
  private: false,
  required: false,
  requireApproval: true,
  triggerNewVersion: true,
  nameKey: 'Name'
}

const EXPECTED_JOB_PERMISSIONS = {
  id: '0',
  officeId: 27259,
  departmentId: 5,
  userRoleId: 17735,
  facilityName: 'PGA National HQ'
}

const EXPECTED_GREENHOUSE_USER = {
  id: '123456',
  firstName: 'firstName',
  lastName: 'lastName'
}

const contextAdminWithMethodMock = (methodName, returnValue) => ({
  user: {
    role: ADMIN_ROLE,
    greenhouseId: 20
  },

  Job: {
    [methodName]: () => Promise.resolve(returnValue)
  },

  NewFacility: {
    findBy: () => Promise.resolve({
      edges: [{
        node: {
          greenhouseId: '20'
        }
      }]
    })
  }
})

test('create job', () => {
  return testSchemaMutation('createJob', {
    context: contextAdminWithMethodMock('create', EXPECTED_JOB),
    variables: {},
    expected: EXPECTED_JOB
  })
})

const contextWithMethodMock = (methodName, returnValue) => ({
  user: {
    role: ANONYMOUS_ROLE
  },

  Job: {
    [methodName]: () => Promise.resolve(returnValue)
  },

  JobApplication: {
    [methodName]: () => Promise.resolve(returnValue)
  },

  NewFacility: { findBy: () => Promise.resolve({
    edges: [{
      node: {
        id: '0017590',
        name: 'PGA National HQ',
        address: {
          address1: '100 Annandale Golf Club Dr',
          address2: 'Madison, MS  39110-8024',
          address3: 'Ste 42',
          address4: 'Bld 24',
          city: 'Kingston Springs',
          country: 'United States',
          state: 'MS',
          zip: '39110-8024'
        },
        greenhouseId: '27259'
      }
    }]
  }) }
})

test('find job', () => {
  return testSchemaQuery('job', {
    context: contextWithMethodMock('find', EXPECTED_JOB_FACILITY),
    variables: {
      id: 'greenhouseid'
    },
    expected: EXPECTED_JOB_FACILITY
  })
})

test('get job custom fields', () => {
  return testSchemaQuery('jobCustomFields', {
    context: contextWithMethodMock('getCustomFields', [EXPECTED_CUSTOM_FIELDS]),
    expected: [EXPECTED_CUSTOM_FIELDS]
  })
})

test('get job permissions', () => {
  return testSchemaQuery('jobPermissions', {
    context: contextWithMethodMock('getJobPermissions', [EXPECTED_JOB_PERMISSIONS]),
    variables: {
      greenhouseId: 57574
    },
    expected: [EXPECTED_JOB_PERMISSIONS]
  })
})

test('get jobs by greenhouse id', () => {
  return testSchemaQuery('jobsByGreenhouseUserId', {
    context: contextAdminWithMethodMock('getJobsPostedBy', [EXPECTED_JOB]),
    variables: {
      greenhouseId: 57574
    },
    expected: [EXPECTED_JOB]
  })
})

test('create job application', () => {
  return testSchemaMutation('createJobApplication', {
    context: contextWithMethodMock('create', EXPECTED_JOB_APPLICATION),
    variables: {
      'jobId': '622697',
      'firstName': 'JW',
      'lastName': 'Testing',
      'emailAddress': 'jason@testing.com',
      'phoneNumber': '555-555-5555',
      'website': 'http://testing.com',
      'attachments': [{
        'filename': 'testReusme.doc',
        'type': 'resume'
      }, {
        'filename': 'testCover.doc',
        'type': 'cover_letter'
      }]
    },
    expected: EXPECTED_JOB_APPLICATION
  })
})

test('duplicate job', () => {
  return testSchemaMutation('duplicateJob', {
    context: contextAdminWithMethodMock('duplicate', EXPECTED_DUPLICATED_JOB),
    variables: {
      id: 100001,
      jobTitle: 'Roman Test Job_Copy'
    },
    expected: EXPECTED_DUPLICATED_JOB
  })
})

test('update job', () => {
  return testSchemaMutation('updateJob', {
    context: contextAdminWithMethodMock('update', EXPECTED_UPDATED_JOB),
    variables: {
      id: 100001,
      input: {
        userId: 528451,
        office: 27259,
        applicantGroup: 11382848,
        jobCategory: 11630500,
        jobTitle: 'Roman Test Job',
        employmentType: 10684619,
        yearsExperience: 11220424,
        submissionDeadline: '2018-12-31',
        baseCompensation: '10.00',
        paySchedule: 11220408,
        contactName: 'Roman',
        contactTitle: 'Developer',
        contactEmail: 'rfedoseev@pgahq.com',
        applyVia: 11612190,
        overview: 'demo'
      }
    },
    expected: EXPECTED_UPDATED_JOB
  })
})

test('update job to removed', () => {
  return testSchemaMutation('updateJob', {
    context: contextAdminWithMethodMock('update', EXPECTED_UPDATED_JOB),
    variables: {
      id: 100001,
      input: {
        userId: 528451,
        currentStep: 'Removed'
      }
    },
    expected: EXPECTED_UPDATED_JOB
  })
})

test('create job permission', () => {
  const expectedPermission = {
    id: 100,
    officeId: 200,
    userRoleId: 17735
  }

  return testSchemaMutation('createJobPermission', {
    context: contextAdminWithMethodMock('createJobPermission', expectedPermission),
    variables: {
      facilityId: '200'
    },
    expected: {
      id: '100',
      officeId: 200,
      userRoleId: 17735
    }
  })
})

test('create job greenhouse user', () => {
  return testSchemaMutation('createUser', {
    context: contextAdminWithMethodMock('createUser', EXPECTED_GREENHOUSE_USER),
    variables: {
      input: {
        firstName: 'firstName',
        lastName: 'lastName',
        primaryEmail: 'first@email.com'
      }
    },
    expected: EXPECTED_GREENHOUSE_USER
  })
})
