const { MEMBER_ROLE } = require('../AccessControlList')
const { testSchemaMutation } = require('../SchemaTester')

const variables = { id: '03615121', productCode: 'M1' }

const EXPECTED = {
  id: '39723',
  product: { code: 'M1' }
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { id: '03615121', role: MEMBER_ROLE },
  Pga: { [methodName]: () => Promise.resolve(returnValue) }
})

test('register order', () => {
  return testSchemaMutation('register', {
    context: contextWithMethodMock('register'),
    variables,
    expected: EXPECTED
  })
})
