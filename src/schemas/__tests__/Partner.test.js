const { omit } = require('ramda')

const { ADMIN_ROLE, EVENT_PARTNER_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const INPUT = {
  id: 'arn:aws:iam::181477382365:user/lionforest',
  displayName: 'Lion Forest',
  role: EVENT_PARTNER_ROLE,
  sectionId: 'PGA'
}

const EXPECTED = {
  id: INPUT.id,
  displayName: INPUT.displayName,
  role: INPUT.role,
  section: { id: INPUT.sectionId },
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Partner: { [methodName]: () => Promise.resolve(returnValue) },
  Section: { find: () => Promise.resolve(EXPECTED.section) }
})

test('create partner', () => {
  return testSchemaMutation('createPartner', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update partner', () => {
  return testSchemaMutation('updatePartner', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: omit(['id'], INPUT) },
    expected: EXPECTED
  })
})

test('delete partner', () => {
  return testSchemaMutation('deletePartner', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find partner', () => {
  return testSchemaQuery('partner', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list partners', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('partners', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
