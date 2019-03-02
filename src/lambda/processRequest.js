const { debug } = require('@pga/logger')
const { graphqlLambda } = require('apollo-server-lambda')

const runQuery = ({ event, schema, context }) => {
  return new Promise((resolve, reject) => {
    const logFunction = ({ key, data }) => key && debug(key, data)
    const handler = graphqlLambda({ schema, context, logFunction })

    const callback = (err, data) => err ? reject(err) : resolve(data)
    handler(event, {}, callback)
  })
}

const processRequest = async ({ event, schema, models, authenticator }) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200 }
  }

  const user = await authenticator(event)
  debug('user:', user.id, user.role)

  return runQuery({
    event,
    schema,
    context: { ...models, user }
  })
}

module.exports = processRequest
