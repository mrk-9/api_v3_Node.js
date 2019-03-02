const algoliasearch = require('algoliasearch')
const aws = require('aws-sdk')

const AlgoliaConnector = require('./AlgoliaConnector')
const { createApiV2Connector } = require('./ApiConnector')
const DynamoDbConnector = require('./DynamoDbConnector')
const { getDynamoDbClient } = require('./DynamoDbUtils')
const HarvestApiConnector = require('./HarvestApiConnector')

exports.loadConnectors = (config) => {
  const algoliaClient = algoliasearch(config.ALGOLIA_APP_ID, config.ALGOLIA_API_KEY)

  const dynamoDbClient = getDynamoDbClient(config.DYNAMODB_ENDPOINT)

  const harvestClient = HarvestApiConnector.httpConnection({
    uri: config.HARVEST_API_URL,
    creds: config.HARVEST_API_KEY,
    userId: config.GREENHOUSE_USER_ID
  })

  return {
    algolia: AlgoliaConnector(algoliaClient),
    dynamoDb: new DynamoDbConnector(dynamoDbClient),
    harvest: HarvestApiConnector({ connection: harvestClient }),
    lambda: new aws.Lambda(),
    pgaV2: createApiV2Connector(config.V2_API_URL, config.V2_API_KEY),
    s3: new aws.S3()
  }
}
