const axios = require('axios')
const { debug, error } = require('@pga/logger')

exports.triggerUpdate = (resource, id) => {
  debug(`SB triggered for "${resource}" with uid: ${id}`)
  return axios(`${process.env.SB_URL}/${resource}/${id}`, { method: 'PUT' }).catch(err => error(`axios call error: ${err}`))
}
