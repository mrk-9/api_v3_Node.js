const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaQuery } = require('../SchemaTester')

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  amount: '40.00',
  contractId: 'PGA TOURNAMENT REVENUE CONTRACT',
  contractLine: 'Revenue',
  contractType: 'Revenue Contract',
  createdAt: '2018-02-14T15:52:37.378Z',
  date: '2018-11-06',
  eventTypeName: 'Volunteer Pkg Revenue',
  eventNumber: 12345,
  error: 'Something blew up!',
  invoices: [
    '3tes3141-5211406'
  ],
  organizationName: 'PGA OF AMERICA',
  projectId: '2019 PGA Pro Champ',
  source: 'Trust Event',
  status: 'FAILED',
  taskId: 'Revenue'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  BillingEvent: { [methodName]: () => Promise.resolve(returnValue) }
})

const expectedConnection = connectionWrap(EXPECTED)
test('list billing events', () => {
  return testSchemaQuery('billingEvents', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
