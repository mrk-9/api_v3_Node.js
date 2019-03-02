const Address = require('../../factory/Address')
const { ADMIN_ROLE } = require('../AccessControlList')
const { testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const contextWithMethodMock = (methodName, returnValue) => ({
  user: { role: ADMIN_ROLE },
  PurseBatch: { [methodName]: () => Promise.resolve(returnValue) },
  Event: { find: () => Promise.resolve(returnValue.event) }
})

test('create purse batch', () => {
  const input = {
    id: 'Batch123',
    eventId: '42',
    payouts: [{
      memberNumber: '123456',
      firstName: 'Mike',
      middleInitial: 'W',
      lastName: 'Jones',
      taxId: '666224444',
      amount: '123.45',
      memo: 'Test Transaction',
      address: Address()
    }]
  }

  const expected = {
    id: 'Batch123',
    event: { id: input.eventId },
    payouts: input.payouts,
    createdAt: '2018-02-14T15:52:37.378Z'
  }

  return testSchemaMutation('createPurseBatch', {
    context: contextWithMethodMock('create', expected),
    variables: { input },
    expected
  })
})

test('check event player', () => {
  const input = {
    memberNumber: '123456',
    firstName: 'Mike',
    middleInitial: 'W',
    lastName: 'Jones',
    taxId: '666224444',
    address: Address()
  }

  const expected = { ...input }

  return testSchemaQuery('checkEventPlayer', {
    context: contextWithMethodMock('checkEventPlayer', expected),
    variables: { input },
    expected
  })
})
