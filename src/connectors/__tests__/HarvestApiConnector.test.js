jest.mock('axios')
const axios = require('axios')
const HarvestApiConnector = require('../HarvestApiConnector')

const mockConnection = ({ method, endpoint, data }) =>
  Promise.resolve(`method: ${method}, endpoint:${endpoint}${data ? `, data:${JSON.stringify(data)}` : ''}`)

describe('Greenhouse Harvest API Connector', () => {
  const harvestApi = HarvestApiConnector({
    connection: mockConnection
  })

  it('can get job custom fields', () =>
    expect(harvestApi.getJobCustomFields()).resolves.toMatchSnapshot())

  it('can post job', () => {
    const job = {
      template_job_id: 12345,
      number_of_openings: 2,
      job_post_name: 'External Name That Appears On Job Boards',
      job_name: 'Internal Name That Appears On Hiring Plans',
      department_id: 123,
      office_ids: [234, 345],
      requisition_id: 'abc-123',
      opening_ids: ['abc-123-1', 'abc-123-2']
    }

    return expect(harvestApi.postJob({
      job
    })).resolves.toMatchSnapshot()
  })

  it('can patch job', () => {
    const job = {
      id: 144371,
      name: 'New job name',
      requisition_id: '1',
      notes: 'Here are some notes',
      team_and_responsibilities: 'Info',
      how_to_sell_this_job: 'the snacks',
      office_ids: [1556],
      department_id: 74,
      custom_fields: [
        {
          id: 1234,
          value: 'Some new value'
        },
        {
          name_key: 'salary_range',
          min_value: 100000,
          max_value: 150000,
          unit: 'USD'
        },
        {
          id: 5678,
          delete_value: 'true'
        }
      ]
    }
    return expect(harvestApi.patchJob({
      job
    })).resolves.toMatchSnapshot()
  })

  it('can put hiring team', () => {
    const jobId = 'a1'
    const team = {
      hiring_managers: [
        {
          user_id: 1234
        }
      ],
      sourcers: [
        {
          user_id: 4567
        }
      ],
      recruiters: [
        {
          user_id: 5678,
          responsible_for_future_candidates: true,
          responsible_for_active_candidates: true,
          responsible_for_inactive_candidates: true
        },
        {
          user_id: 6789,
          responsible_for_future_candidates: false,
          responsible_for_active_candidates: false,
          responsible_for_inactive_candidates: false
        }
      ],
      coordinators: [
        {
          user_id: 7890,
          responsible_for_future_candidates: true,
          responsible_for_active_candidates: false,
          responsible_for_inactive_candidates: false
        }
      ]
    }

    return expect(harvestApi.putHiringTeam({
      jobId,
      team
    })).resolves.toMatchSnapshot()
  })

  it('can get jobPermissions', () =>
    expect(harvestApi.getJobPermissions()).resolves.toMatchSnapshot())

  it('can create job permissions', () => {
    return expect(harvestApi.putJobPermission(
      123,
      { data: {
        office_id: '345',
        user_role_id: '678'
      }})).resolves.toMatchSnapshot()
  })

  it('can post user', () => {
    const user = {
      first_name: 'first',
      last_name: 'last',
      email: 'first@email.com'
    }
    return expect(harvestApi.postUser({ user }))
      .resolves.toMatchSnapshot()
  })

  it('can find user by email', () => {
    const email = 'test@email.com'
    return expect(harvestApi.findUserByEmail(email))
      .resolves.toMatchSnapshot()
  })
})

axios.mockImplementation((args) => {
  switch (args.method) {
    case 'TEST_EXCEPTION':
      return Promise.reject(new Error('EXCEPTION TESTING'))
    default:
      return Promise.resolve({data: args})
  }
})

describe('Harvest http connection', () => {
  const connection = HarvestApiConnector.httpConnection({userId: 1})

  it('will catch errors', () => {
    const request = {
      method: 'TEST_EXCEPTION'
    }
    return expect(connection(request)).rejects.toBeInstanceOf(Error)
  })

  it('calls http lib correctly', () => {
    const request = {
      method: 'TEST_SUCCESS'
    }
    return expect(connection(request)).resolves.toMatchSnapshot()
  })
})
