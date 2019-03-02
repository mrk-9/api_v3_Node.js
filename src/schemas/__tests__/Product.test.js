const { omit } = require('ramda')

const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const Product = require('../../factory/Product')

const INPUT = omit(['id'], Product())

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  name: INPUT.name,
  event: { id: INPUT.eventId },
  ledgerId: INPUT.ledgerId,
  revenueAccountId: INPUT.revenueAccountId,
  taxAccountId: INPUT.taxAccountId,
  projectAccount: INPUT.projectAccount,
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Product: { [methodName]: () => Promise.resolve(returnValue) },
  Event: { find: () => Promise.resolve(EXPECTED.event) }
})

test('create product', () => {
  return testSchemaMutation('createProduct', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update product', () => {
  return testSchemaMutation('updateProduct', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('delete product', () => {
  return testSchemaMutation('deleteProduct', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find product', () => {
  return testSchemaQuery('product', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list products', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('products', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
