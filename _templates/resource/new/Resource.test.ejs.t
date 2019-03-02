---
to: src/schemas/__tests__/<%=h.inflection.camelize(name)%>.test.js
---
const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const INPUT = {
}

const EXPECTED = {
  id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  createdAt: '2018-02-14T15:52:37.378Z',
  updatedAt: '2018-02-14T15:52:37.378Z'
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  <%=h.inflection.camelize(name)%>: { [methodName]: () => Promise.resolve(returnValue) }
})

testSchemaMutation('create<%=h.inflection.camelize(name)%>', {
  context: contextWithMethodMock('create'),
  variables: { input: INPUT },
  expected: EXPECTED
})

testSchemaMutation('update<%=h.inflection.camelize(name)%>', {
  context: contextWithMethodMock('update'),
  variables: { id: 'id', input: INPUT },
  expected: EXPECTED
})

testSchemaMutation('delete<%=h.inflection.camelize(name)%>', {
  context: contextWithMethodMock('delete'),
  variables: { id: 'id' },
  expected: EXPECTED
})

testSchemaQuery('<%=h.inflection.camelize(name, true)%>', {
  context: contextWithMethodMock('find'),
  variables: { id: 'id' },
  expected: EXPECTED
})

const expectedConnection = connectionWrap(EXPECTED)
testSchemaQuery('<%=h.inflection.pluralize(h.inflection.camelize(name, true))%>', {
  context: contextWithMethodMock('list', expectedConnection),
  variables: { first: 10, after: 'cursor' },
  expected: expectedConnection
})
