const loadEnv = require('@pga/lambda-env')
const { error } = require('@pga/logger')

const createMemberAuthenticator = require('./lambda/createMemberAuthenticator')
const createPartnerAuthenticator = require('./lambda/createPartnerAuthenticator')
const createCorsWrapper = require('./lambda/createCorsWrapper')
const processRequest = require('./lambda/processRequest')
const { loadModels } = require('./models')
const schema = require('./schemas')

const respondWithError = (err) => {
  error(err)

  return {
    statusCode: 400,
    body: JSON.stringify({ errors: [{ message: err.message }] })
  }
}

const createHandler = (authFactory, modelName) => async (event) => {
  process.env = await loadEnv()

  const wrapWithCorsHeaders = createCorsWrapper(event.headers)

  // Local development user override
  if (process.env.USER_ARN) {
    event.requestContext.identity.userArn = process.env.USER_ARN
  }

  const models = loadModels(process.env)
  const authenticator = authFactory(models[modelName])

  return processRequest({ event, schema, models, authenticator })
    .catch(respondWithError)
    .then(wrapWithCorsHeaders)
}

exports.partner = createHandler(createPartnerAuthenticator, 'Partner')

exports.member = createHandler(createMemberAuthenticator, 'Member')
