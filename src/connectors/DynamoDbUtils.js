const aws = require('aws-sdk')

const ACTIONS_DELIMITER = ', '
const CONDITION_DELIMITER = ' and '

const buildExpressionValue = attributeName => `:${attributeName}`

const buildExpressionName = attributeName => `#${attributeName}`

const buildExpressionAction = (key) => {
  const expressionName = buildExpressionName(key)
  const expressionValue = buildExpressionValue(key)

  return `${expressionName} = ${expressionValue}`
}

const buildExpressionAttributeNames = (attributes) => {
  const expressionAttributeNames = {}

  Object.keys(attributes).forEach((attributeName) => {
    const expressionNameKey = buildExpressionName(attributeName)
    expressionAttributeNames[expressionNameKey] = attributeName
  })

  return expressionAttributeNames
}

const buildExpressionAttributeValues = (attributes) => {
  const expressionAttributeValues = {}

  Object.keys(attributes).forEach((attributeName) => {
    const expressionValueKey = buildExpressionValue(attributeName)
    const attributeValue = attributes[attributeName]

    expressionAttributeValues[expressionValueKey] = attributeValue
  })

  return expressionAttributeValues
}

const buildKeyConditionExpression = (attributes) => {
  const conditionExpression = Object.keys(attributes)
    .map(buildExpressionAction)
    .join(CONDITION_DELIMITER)

  return conditionExpression
}

const buildUpdateExpression = (attributes) => {
  const updateExpression = Object.keys(attributes)
    .map(buildExpressionAction)
    .join(ACTIONS_DELIMITER)

  return `SET ${updateExpression}`
}

let dynamoDbClient
const getDynamoDbClient = (endpoint) => {
  if (dynamoDbClient == null) {
    const options = { endpoint, convertEmptyValues: true }
    dynamoDbClient = new aws.DynamoDB.DocumentClient(options)
  }

  return dynamoDbClient
}

const buildIndexName = (attributes) => {
  const indexName = Object.keys(attributes)
    .sort()
    .join('')

  return `${indexName}Index`
}

const buildQueryParams = ({
  tableName,
  attributes,
  limit,
  cursor
}) => {
  const queryParams = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
    IndexName: buildIndexName(attributes),
    Limit: limit,
    ExclusiveStartKey: cursor,
    KeyConditionExpression: buildKeyConditionExpression(attributes),
    ExpressionAttributeNames: buildExpressionAttributeNames(attributes),
    ExpressionAttributeValues: buildExpressionAttributeValues(attributes)
  }

  return queryParams
}

const buildUpdateParams = (tableName, itemId, item) => {
  const updateParams = {
    TableName: tableName,
    Key: { id: itemId },
    ExpressionAttributeNames: buildExpressionAttributeNames(item),
    ExpressionAttributeValues: buildExpressionAttributeValues(item),
    UpdateExpression: buildUpdateExpression(item),
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(id)'
  }

  return updateParams
}

module.exports = {
  buildUpdateParams,
  buildQueryParams,
  getDynamoDbClient,
  buildUpdateExpression,
  buildKeyConditionExpression,
  buildExpressionAttributeNames,
  buildExpressionAttributeValues,
  buildExpressionAction
}
