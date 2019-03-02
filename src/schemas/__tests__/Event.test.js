const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const INPUT = {
  name: 'National Championship',
  sectionId: '32',
  closed: true
}

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  name: INPUT.name,
  section: { id: INPUT.sectionId },
  closed: INPUT.closed,
  products: connectionWrap({ id: '005' }),
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Event: { [methodName]: () => Promise.resolve(returnValue) },
  Product: { findBy: () => Promise.resolve(EXPECTED.products) },
  Section: { find: () => Promise.resolve(EXPECTED.section) }
})

test('create event', () => {
  return testSchemaMutation('createEvent', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update event', () => {
  return testSchemaMutation('updateEvent', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('delete event', () => {
  return testSchemaMutation('deleteEvent', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find event', () => {
  return testSchemaQuery('event', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list events', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('events', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
