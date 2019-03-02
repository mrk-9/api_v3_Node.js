const { ADMIN_ROLE } = require('../AccessControlList')
const Address = require('../../factory/Address')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const INPUT = {
  id: '0017590',
  name: 'Annandale Golf Club',
  sectionId: '045',
  universalId: '120544446',
  address: Address(),
  greenhouseId: '45189'
}

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  name: INPUT.name,
  section: { id: INPUT.sectionId },
  universalId: INPUT.universalId,
  address: INPUT.address,
  greenhouseId: INPUT.greenhouseId,
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Facility: { [methodName]: () => Promise.resolve(returnValue) },
  NewFacility: { [methodName]: () => Promise.resolve(returnValue) },
  Section: { find: () => Promise.resolve(EXPECTED.section) }
})

test('create facility', () => {
  return testSchemaMutation('createFacility', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update facility', () => {
  return testSchemaMutation('updateFacility', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('delete facility', () => {
  return testSchemaMutation('deleteFacility', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find facility', () => {
  return testSchemaQuery('facility', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list facilities', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('facilities', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
