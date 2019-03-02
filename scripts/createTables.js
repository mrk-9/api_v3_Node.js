const aws = require('aws-sdk')
const { omit, values } = require('ramda')
const yaml = require('yamljs')

const PROPERTIES_BLACKLIST = ['SSESpecification']

const [,, samTemplateFile = 'template.yml'] = process.argv
const samTemplate = yaml.load(samTemplateFile)

const db = new aws.DynamoDB({ endpoint: process.env.DYNAMODB_ENDPOINT })
const createPromises = values(samTemplate.Resources)
  .filter(resource => resource.Type === 'AWS::DynamoDB::Table')
  .map(table => {
    const createAttributes = omit(PROPERTIES_BLACKLIST, table.Properties)
    return db.createTable(createAttributes).promise()
  })

Promise.all(createPromises).then(console.log)
