const aws = require('aws-sdk')
const casual = require('casual')
const { prop, sortBy, times } = require('ramda')
const uuidv4 = require('uuid/v4')

const DynamoDbConnector = require('../DynamoDbConnector')
const { getDynamoDbClient } = require('../../connectors/DynamoDbUtils')

const ISO_DATE_REGEX = /\d+-\d+-\d+T\d+:\d+:\d+/

casual.define('id', () => uuidv4())

const createInput = () => ({
  id: casual.id,
  name: casual.name,
  sectionId: String(casual.integer(0, 99))
})

const attributes = createInput()

const expected = { ...attributes }
expected.createdAt = expect.stringMatching(ISO_DATE_REGEX)

const TABLE = `Test${Date.now()}`
const client = getDynamoDbClient(process.env.DYNAMODB_ENDPOINT)
const connector = new DynamoDbConnector(client)

const db = new aws.DynamoDB({ endpoint: process.env.DYNAMODB_ENDPOINT })
beforeAll(() => {
  const request = db.createTable({
    TableName: TABLE,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'sectionId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'sectionIdIndex',
        KeySchema: [
          { AttributeName: 'sectionId', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ]
  })

  return request.promise()
})

afterAll(() => db.deleteTable({ TableName: TABLE }).promise())

const sortById = sortBy(prop('id'))

describe('create', () => {
  afterEach(() => connector.remove(TABLE, attributes.id))

  test('creates object', () =>
    connector.create(TABLE, attributes)
      .then(() => connector.find(TABLE, attributes.id))
      .then(result => expect(result).toMatchObject(expected)))

  test('returns created objects', () =>
    expect(connector.create(TABLE, attributes)).resolves.toMatchObject(expected))

  describe('duplicate id', () => {
    beforeEach(() => connector.create(TABLE, attributes))

    test('rejects if id already exists', () =>
      expect(connector.create(TABLE, attributes))
        .rejects.toEqual(new Error(`${TABLE} ID '${attributes.id}' already exists!`)))
  })
})

describe('createBatch', () => {
  const listItems = sortById(times(createInput, 5))

  test('exceed max retries', () => {
    const batchWriteMock = jest.fn(({ RequestItems: items }) => {
      // Return all RequestItems as UnprocessedItems
      const promiseMock = () => Promise.resolve({ UnprocessedItems: items })
      return { promise: promiseMock }
    })

    const clientMock = { batchWrite: batchWriteMock }
    const connectorWithMock = new DynamoDbConnector(clientMock)

    return expect(connectorWithMock.createBatch(TABLE, listItems, { maxRetries: 2 }))
      .rejects.toEqual(new Error('Unable to create 5 item(s) after 2 retries'))
  })

  describe('success', () => {
    afterEach(() => {
      listItems.forEach(item => connector.remove(TABLE, item.id))
    })

    test('creates objects', () =>
      connector.createBatch(TABLE, listItems)
        .then(results => expect(sortById(results)).toMatchObject(listItems)))
  })
})

describe('find', () => {
  beforeAll(() => connector.create(TABLE, attributes))

  afterAll(() => connector.remove(TABLE, attributes.id))

  test('finds test object', () =>
    expect(connector.find(TABLE, attributes.id)).resolves.toMatchObject(expected))

  test('returns empty object when item is not found', () =>
    expect(connector.find(TABLE, 'not-in-db')).resolves.toBeNull())
})

test('find null id', () => expect(connector.find(TABLE, null)).resolves.toBeNull())

describe('findBy', () => {
  beforeAll(() => connector.create(TABLE, attributes))

  afterAll(() => connector.remove(TABLE, attributes.id))

  test('findBy existing sectionId', () =>
    expect(connector.findBy(TABLE, { sectionId: attributes.sectionId }, { limit: 1 }))
      .resolves.toMatchObject([expected]))

  test('findBy unknown sectionId', () =>
    expect(connector.findBy(TABLE, { sectionId: '111' })).resolves.toEqual([]))
})

describe('all', () => {
  describe('table has items', () => {
    let inputs

    beforeAll(() => {
      inputs = sortById(times(createInput, 2))
      return connector.createBatch(TABLE, inputs)
    })

    afterAll(() => {
      const removeItem = createdItem => connector.remove(TABLE, createdItem.id)
      const requests = inputs.map(removeItem)
      return Promise.all(requests)
    })

    test('return items', () =>
      connector.all(TABLE).then(result => expect(sortById(result)).toMatchObject(inputs)))

    test('return 1 item when limit is 1', () =>
      connector.all(TABLE, { limit: 1 }).then(result => expect(result.length).toBe(1)))

    test('cursor return next set of results', () =>
      connector.all(TABLE, { limit: 1 })
        .then((firstSet) => {
          const [item] = firstSet
          const query = connector.all(TABLE, { limit: 1, cursor: item.cursor })
          return Promise.all([query, firstSet])
        })
        .then(([secondSet, firstSet]) => {
          const results = sortById(firstSet.concat(secondSet))
          expect(results).toMatchObject(inputs)
        }))
  })

  test('returns empty array when table is empty', () =>
    expect(connector.all(TABLE)).resolves.toEqual([]))
})

describe('findBatch', () => {
  describe('table has items', () => {
    let inputs
    let ids

    beforeAll(() => {
      inputs = sortById(times(createInput, 2))
      ids = inputs.map(input => input.id)
      return connector.createBatch(TABLE, inputs)
    })

    afterAll(() => {
      const removeItem = createdItem => connector.remove(TABLE, createdItem.id)
      const requests = inputs.map(removeItem)
      return Promise.all(requests)
    })

    test('return items', () =>
      connector.findBatch(TABLE, ids)
        .then(result => expect(sortById(result)).toMatchObject(inputs)))
  })

  test('returns null if ids is null', () =>
    expect(connector.findBatch(TABLE)).resolves.toBeNull())

  test('returns null if ids is empty', () =>
    expect(connector.findBatch(TABLE, [])).resolves.toEqual([]))

  test('returns empty array when ids are not found', () =>
    expect(connector.findBatch(TABLE, ['id', 'other-id'])).resolves.toEqual([]))
})

describe('remove', () => {
  beforeEach(() => connector.create(TABLE, attributes))

  test('removes object', () =>
    connector.remove(TABLE, attributes.id)
      .then(() => connector.find(TABLE, attributes.id))
      .then(result => expect(result).toBeNull()))

  test('returns removed object', () =>
    expect(connector.remove(TABLE, attributes.id)).resolves.toMatchObject(expected))
})

describe('update', () => {
  const newAttributes = { name: 'new' }

  describe('existing item', () => {
    beforeEach(() => connector.create(TABLE, attributes))

    afterEach(() => connector.remove(TABLE, attributes.id))

    const updatedObject = {
      ...expected,
      ...newAttributes,
      updatedAt: expect.stringMatching(ISO_DATE_REGEX)
    }

    test('updates object', () =>
      connector.update(TABLE, attributes.id, newAttributes)
        .then(() => connector.find(TABLE, attributes.id))
        .then(result => expect(result).toMatchObject(updatedObject)))

    test('returns updated object', () =>
      expect(connector.update(TABLE, attributes.id, newAttributes))
        .resolves.toMatchObject(updatedObject))
  })

  test('non existing id', () =>
    expect(connector.update(TABLE, attributes.id, {}))
      .rejects.toEqual(new Error(`ID ${attributes.id} does not exist in ${TABLE}!`)))
})
