const axios = require('axios')

exports.createApiV2Connector = (apiUrl, apiKey) => ({
  get: async (id, path) => {
    const url = `${apiUrl}/members/${id}/${path}?apikey=${apiKey}`
    const { data: { data } } = await axios(url, { responseType: 'json' })
    return data || []
  },

  update: async (id, resource, payload) => {
    const url = `${apiUrl}/members/${id}/${resource}?apikey=${apiKey}`
    const { data, status } = await axios.post(url, payload, { responseType: 'json' })
    return {
      success: status === 200,
      data: data,
      errors: data.errors
    }
  }
})
