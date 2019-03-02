const fs = require('fs')
const { splitEvery, sum } = require('ramda')

const DynamoDbConnector = require('../src/connectors/DynamoDbConnector')
const { getDynamoDbClient } = require('../src/connectors/DynamoDbUtils')

const MAX_BATCH_SIZE = 25

const [,, seedFile = 'seed.json'] = process.argv
const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'))

const client = getDynamoDbClient(process.env.DYNAMODB_ENDPOINT)
const connector = new DynamoDbConnector(client)

const createBatchPromises = Object.keys(seedData)
  .map((table) => {
    const batches = splitEvery(MAX_BATCH_SIZE, seedData[table])
      .map(batch => connector.createBatch(table, batch))

    return Promise.all(batches)
      .then((results) => {
        const total = sum(results.map(batch => batch.length))
        return `Added ${total} to ${table}`
      })
  })

Promise.all(createBatchPromises).then(console.log)
