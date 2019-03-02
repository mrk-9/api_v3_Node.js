const HarvestApiConnector = require('../../connectors/HarvestApiConnector')
const JobModel = require('../JobModel')
const JobObj = require('./__data__/jobObj.json')

const mockConnection = ({ userId }) => ({ method, endpoint, data }) => {
  const urlToPayload = {
    'jobs': JobObj,

    'jobs/123456/hiring_team': { success: true },

    'jobs/100001/hiring_team': { success: true },

    'jobs/123456': { userId, method, endpoint, data },

    'jobs/100001': JobObj,

    'custom_fields/job': [
      {
        id: 131029,
        field_type: 'job',
        priority: 2,
        value_type: 'single_select',
        private: false,
        required: true,
        require_approval: false,
        trigger_new_version: false,
        name: 'Employment Type',
        name_key: 'employment_type',
        active: true,
        custom_field_options: [
          {
            id: 10684619,
            name: 'Seasonal',
            priority: 0
          },
          {
            id: 11784837,
            name: 'Year Round',
            priority: 1
          },
          {
            id: 11220411,
            name: 'Part Time',
            priority: 2
          }
        ]
      }
    ],

    'users': {
      id: 1017652,
      first_name: 'first',
      last_name: 'last'
    },

    'users/597529/permissions/future_jobs?per_page=125': [
      {
        id: 361480,
        office_id: 27259,
        department_id: null,
        user_role_id: 17735
      }
    ],

    'users/597529/permissions/jobs?per_page=500': [
      {
        id: 46288285,
        job_id: 741762,
        user_role_id: 17735
      }
    ],

    'users/123/permissions/future_jobs': {
      id: '123',
      user_role_id: '566',
      office_id: '999'
    },

    'users?email=test@email.com': {
      id: 123456,
      name: 'test',
      first_name: 'first_test',
      last_name: 'last_test',
      updated_at: '2019-02-28T17:12:22.818Z',
      created_at: '2019-02-28T17:12:22.818Z',
      disabled: false,
      site_admin: false,
      emails: [
        'test@email.com'
      ],
      employee_id: null
    }
  }

  const payload = urlToPayload[endpoint]

  if (!payload) {
    throw new Error(`unmocked endpoint: '${endpoint}'`)
  }

  return Promise.resolve(payload)
}

describe('Job Model', () => {
  const harvest = HarvestApiConnector({ connection: mockConnection({ userId: 786605 }) })
  const model = JobModel({ harvest })

  it('can get custom fields', () => {
    return expect(model.getCustomFields())
      .resolves
      .toMatchSnapshot()
  })

  it('can save a new job', () => {
    Math.random = jest.fn(() => 1)

    const newJob = {
      userId: 786605,
      office: 27259,
      applicantGroup: 11382848,
      jobCategory: 11630500,
      jobTitle: 'Test Job -sw',
      employmentType: 10684619,
      yearsExperience: 11220424,
      submissionDeadline: '2018-04-30',
      baseCompensation: 50,
      baseCompensationMax: 80,
      paySchedule: 11220408,
      additionalIncome: 'additional income field',
      totalCompensation: 70,
      contactName: 'test user',
      contactTitle: 'test title',
      contactEmail: 'test@testmail.com',
      education: 11220428,
      applyVia: 11612190,
      website: 'https://www.test.com/jobs',
      overview: 'overview field',
      experienceRequired: '<ul><li>experience field</li></ul>',
      responsibilities:
        '<em>essential responsiblities field</em>benefits: <strong>benefits field</strong>',
      benefits: '<h1>benefits</h1>',
      termOfServiceAgreement: true
    }

    return expect(model.create(newJob))
      .resolves
      .toMatchSnapshot()
  })

  it('can get job permissions', () => {
    return expect(model.getJobPermissions('597529'))
      .resolves
      .toMatchSnapshot()
  })

  it('can create job permissions', async () => {
    return expect(model.createJobPermission(123,
      {
        user_role_id: '566',
        office_id: '999'
      }))
      .resolves
      .toMatchSnapshot()
  })

  it('can update job', () => {
    return expect(model.update(100001, { currentStep: 'Removed' }))
      .resolves
      .toMatchSnapshot()
  })

  it('can duplicate job', () => {
    return expect(model.duplicate(100001, 'job Title (Copy)'))
      .resolves
      .toMatchSnapshot()
  })

  it('can create user', () => {
    const payload = {
      first_name: 'firstName',
      last_name: 'lastName',
      primaryEmail: 'first@email.com'
    }
    return expect(model.createUser(payload))
      .resolves
      .toMatchSnapshot()
  })

  it('can find user by email', () => {
    const email = 'test@email.com'
    return expect(model.findUserByEmail(email))
      .resolves
      .toMatchSnapshot()
  })
})

const GREENHOUSE_ID = '123'

const EXPECTED_MY_JOBS = {
  [GREENHOUSE_ID]: [{ job_id: 334 }]
}

const ALGOLIA_JOBS = [{
  id: '334',
  jobId: 334,
  userId: '0',
  hiringManager: {
    id: '',
    firstName: '',
    lastName: '',
    employeeId: ''
  },
  applicantGroup: '',
  job_category: 'Seasonal',
  jobTitle: 'PGA Pro',
  status: 'open',
  employment_type: 'Hourly',
  years_experience: '2 years',
  submission_deadline: 1530158400,
  base_compensation: { value: 14 },
  base_compensation_max: { value: 55 },
  pay_schedule: '',
  additional_income: null,
  total_compensation: { value: 66 },
  job_contact_name: 'John Newkirk',
  job_contact_title: 'PGA Pro',
  job_contact_email: 'jnewkirk@pgahq.com',
  education_required: ["bachelor's"],
  apply_via: null,
  website: 'http://website.com/',
  overview: '',
  experience_required: '2 years',
  responsibilities: 'Golf professional',
  benefits: 'free rounds',
  tos: false,
  current_step: 'Completed',
  opened: 1529012518,
  created: 1529012518,
  facilities: [{
    greenhouse_id: 123,
    facility_name: 'PGAHQ'
  }]
}]

describe('Job Model', () => {
  test('getJobsPostedBy', () => {
    const algoliaMock = {
      findBatch: (index, jobIds) => {
        const results = ALGOLIA_JOBS.filter(j => jobIds.includes(j.id))
        return Promise.resolve(results)
      }
    }

    const harvestMock = {
      getMyJobs: (greenhouseId) => Promise.resolve(EXPECTED_MY_JOBS[greenhouseId])
    }

    const model = JobModel({
      algolia: algoliaMock,
      harvest: harvestMock
    })

    const member = { greenhouseId: GREENHOUSE_ID }

    return expect(model.getJobsPostedBy(member))
      .resolves
      .toMatchSnapshot()
  })
})
