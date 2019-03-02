const { debug, error } = require('@pga/logger')
const axios = require('axios')
const util = require('util')

const getHeaders = ({ creds, userId }) => ({
  Authorization: `Basic ${Buffer.from(`${creds}:`).toString('base64')}`,
  'Content-Type': 'application/json',
  'On-Behalf-Of': userId
})

module.exports = ({ connection }) => ({
  findJob: id => connection({
    method: 'GET',
    endpoint: `jobs/${id}` }
  ),

  findUserByEmail: email => connection({
    method: 'GET',
    endpoint: `users?email=${email}`
  }),

  getJobCustomFields: () => connection({
    method: 'GET',
    endpoint: 'custom_fields/job'
  }),

  getJobPermissions: greenhouseId => connection({
    method: 'GET',
    endpoint: `users/${greenhouseId}/permissions/future_jobs?per_page=125`
  }),

  getMyJobs: greenhouseId => connection({
    method: 'GET',
    endpoint: `users/${greenhouseId}/permissions/jobs?per_page=500`
  }),

  postJob: ({ job }) =>
    connection({
      method: 'POST',
      endpoint: 'jobs',
      data: job
    }),

  patchJob: ({ job }) =>
    connection({
      method: 'PATCH',
      endpoint: `jobs/${job.id}`,
      data: job
    }),

  putHiringTeam: ({ jobId, team }) =>
    connection({
      method: 'PUT',
      endpoint: `jobs/${jobId}/hiring_team`,
      data: team
    }),

  postJobApplication: data =>
    connection({
      method: 'POST',
      endpoint: 'candidates',
      data: JSON.stringify(data)
    }),

  putJobPermission: (id, data) =>
    connection({
      method: 'PUT',
      endpoint: `users/${id}/permissions/future_jobs`,
      data
    }),

  postUser: (data) =>
    connection({
      method: 'POST',
      endpoint: 'users',
      data
    })

})

module.exports.httpConnection = ({ userId, uri, creds }) => async ({ method, endpoint, data }) => {
  try {
    const response = await axios({
      url: `${uri}${endpoint}`,
      headers: getHeaders({ creds, userId }),
      data,
      method
    })
    debug(`HarvestAPI Response:${util.inspect(response)}`)
    return response.data
  } catch (err) {
    error(`HarvestAPI Error:${util.inspect(err)}`)
    throw err
  }
}
