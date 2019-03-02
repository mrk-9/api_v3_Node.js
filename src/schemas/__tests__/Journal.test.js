const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaQuery } = require('../SchemaTester')

const EXPECTED = {
  createdAt: '2018-11-14T18:48:13.076Z',
  date: '2018-10-25',
  id: 'c23eae39d4c23cb91aaabb049b7edab6 300000002100001',
  journalEntries: [{
    accountId: '1830-10000-100000-101115-0',
    amount: '200.00',
    date: '2018-10-25',
    invoices: ['4713492255019639812'],
    ledgerId: '300000002100001',
    source: 'Golf Genius'
  }],
  ledgerId: '300000002100001',
  source: 'Golf Genius',
  status: 'FAILED',
  error: 'something went wrong!'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Journal: { [methodName]: () => Promise.resolve(returnValue) }
})

test('list journals', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('journals', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
