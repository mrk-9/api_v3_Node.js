const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')
const Address = require('../../factory/Address')
const Consultant = require('../../factory/Consultant')
const Coordinator = require('../../factory/Coordinator')

const INPUT = {
  name: 'South Florida Section',
  address: Address(),
  careerConsultant: Consultant(),
  internshipCoordinator: Coordinator()
}

const ExpectedFacility = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b'
}

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  name: INPUT.name,
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z',
  address: INPUT.address,
  careerConsultant: INPUT.careerConsultant,
  internshipCoordinator: INPUT.internshipCoordinator,
  paymentTypes: connectionWrap({ id: '005' }),
  primaryFacility: {
    id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b'
  }
}

const EXPECTED_STATE_SECTIONS = [
  { id: '030' },
  { id: '135' },
  { id: '195' }
]

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Section: { [methodName]: () => Promise.resolve(returnValue) },
  PaymentType: { findBy: () => Promise.resolve(EXPECTED.paymentTypes) },
  NewFacility: { findBy: () => Promise.resolve({ edges: [ { node: ExpectedFacility } ] }) }
})

test('find state sections', () => {
  return testSchemaQuery('stateSections', {
    context: contextWithMethodMock('findBatch', EXPECTED_STATE_SECTIONS),
    variables: { state: 'FL' },
    expected: EXPECTED_STATE_SECTIONS
  })
})

test('create section', () => {
  return testSchemaMutation('createSection', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('update section', () => {
  return testSchemaMutation('updateSection', {
    context: contextWithMethodMock('update'),
    variables: { id: 'id', input: INPUT },
    expected: EXPECTED
  })
})

test('delete section', () => {
  return testSchemaMutation('deleteSection', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('find section', () => {
  return testSchemaQuery('section', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list sections', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('sections', {
    context: contextWithMethodMock('list', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})
