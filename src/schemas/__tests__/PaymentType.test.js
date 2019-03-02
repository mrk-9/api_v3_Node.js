const { omit } = require('ramda')

const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')
const PaymentType = require('../../factory/PaymentType')

const INPUT = omit(['id'], PaymentType())

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  name: INPUT.name,
  section: { id: INPUT.sectionId },
  ledgerId: INPUT.ledgerId,
  clearingAccountId: INPUT.clearingAccountId,
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  PaymentType: { [methodName]: () => Promise.resolve(returnValue) },
  Section: { find: () => Promise.resolve(EXPECTED.section) }
})

test('create payment type', () => {
  return testSchemaMutation('createPaymentType', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update payment type', () => {
  return testSchemaMutation('updatePaymentType', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('delet payment type', () => {
  return testSchemaMutation('deletePaymentType', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find payment type', () => {
  return testSchemaQuery('paymentType', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list payment types', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('paymentTypes', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
