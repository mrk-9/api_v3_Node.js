const { pathSatisfies, pathOr, pick } = require('ramda')
const uuidv4 = require('uuid/v4')
const { debug } = require('@pga/logger')

const { buildUpdateParams, buildQueryParams } = require('./DynamoDbUtils')

module.exports = class DynamoDbConnector {
  static generateId () {
    return uuidv4()
  }

  static generateTimestamp () {
    return new Date().toISOString()
  }

  static newItem (attributes) {
    const newAttributes = {
      id: DynamoDbConnector.generateId(),
      createdAt: DynamoDbConnector.generateTimestamp()
    }

    return { ...newAttributes, ...attributes }
  }

  static updatedItem (itemAttributes) {
    const updatedAttributes = { updatedAt: DynamoDbConnector.generateTimestamp() }
    return { ...updatedAttributes, ...itemAttributes }
  }

  static createCursor (item, keys = []) {
    return pick(['id', ...keys], item)
  }

  constructor (client) {
    this.client = client
  }

  async all (table, { limit, cursor } = {}) {
    debug('all:', table, limit)
    const scanParams = {
      TableName: table,
      Limit: limit,
      ExclusiveStartKey: cursor
    }

    const { Items: items } = await this.client.scan(scanParams).promise()

    return items.map((item) => {
      const itemCursor = DynamoDbConnector.createCursor(item)
      return { cursor: itemCursor, ...item }
    })
  }

  async create (table, attributes) {
    const item = DynamoDbConnector.newItem(attributes)

    const createParams = {
      TableName: table,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)'
    }

    try {
      await this.client.put(createParams).promise()
      return item
    } catch (error) {
      throw (error.code === 'ConditionalCheckFailedException')
        ? new Error(`${table} ID '${item.id}' already exists!`)
        : error
    }
  }

  async sendBatch (table, { requestItems, attempt = 0, maxRetries }) {
    const results = await this.client.batchWrite({ RequestItems: requestItems }).promise()

    const path = ['UnprocessedItems', table]
    const hasUnprocessedItems = pathSatisfies(items => items && items.length > 0, path)

    if (!hasUnprocessedItems(results)) {
      // All items were created
      return true
    }

    if (attempt >= maxRetries) {
      const totalUnprocessed = pathOr(0, ['UnprocessedItems', table, 'length'], results)
      throw new Error(`Unable to create ${totalUnprocessed} item(s) after ${attempt} retries`)
    }

    // Retry unprocessed items
    return this.sendBatch(table, {
      requestItems: results.UnprocessedItems,
      attempt: attempt + 1,
      maxRetries
    })
  }

  async createBatch (table, batch, { maxRetries = 3 } = {}) {
    const items = batch.map(attributes => DynamoDbConnector.newItem(attributes))

    const createItemPutRequest = item => ({ PutRequest: { Item: item } })
    const putRequests = items.map(createItemPutRequest)
    const requestItems = { [table]: putRequests }

    await this.sendBatch(table, { requestItems, maxRetries })
    return items
  }

  async remove (table, id) {
    debug('delete:', table, id)

    const deleteParams = {
      TableName: table,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    }

    const { Attributes: attributes } = await this.client.delete(deleteParams).promise()
    return attributes
  }

  async find (table, id) {
    debug('find:', table, id)

    if (id == null) {
      return null
    }

    const getParams = {
      TableName: table,
      Key: { id }
    }

    const { Item: item } = await this.client.get(getParams).promise()
    return item || null
  }

  async findBatch (table, ids) {
    debug('findBatch:', table, ids)

    if (ids == null) {
      return null
    }

    if (!ids.length) {
      return []
    }

    const requestKeys = ids.map(id => ({ id }))

    const batchGetParams = {
      RequestItems: {
        [table]: { Keys: requestKeys }
      }
    }

    const request = this.client.batchGet(batchGetParams)
    const { Responses: { [table]: items } } = await request.promise()
    return items
  }

  async findBy (table, attributes, { limit, cursor } = {}) {
    debug('findBy:', table, attributes, limit)
    const queryParams = buildQueryParams({
      tableName: table,
      attributes,
      limit,
      cursor
    })

    const { Items: items } = await this.client.query(queryParams).promise()

    return items.map((item) => {
      const cursorKeys = Object.keys(attributes)
      const itemCursor = DynamoDbConnector.createCursor(item, cursorKeys)
      return { cursor: itemCursor, ...item }
    })
  }

  async update (table, id, attributes) {
    debug('update:', table, id, attributes)

    const item = DynamoDbConnector.updatedItem(attributes)
    const updateParams = buildUpdateParams(table, id, item)

    try {
      const { Attributes: newAttributes } = await this.client.update(updateParams).promise()
      return newAttributes
    } catch (error) {
      throw (error.code === 'ConditionalCheckFailedException')
        ? new Error(`ID ${id} does not exist in ${table}!`)
        : error
    }
  }
}
