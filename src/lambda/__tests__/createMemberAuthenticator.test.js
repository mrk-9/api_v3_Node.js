const createOneloginTokenParser = require('../createOneloginTokenParser')
const createMemberAuthenticator = require('../createMemberAuthenticator')
const {
  ANONYMOUS_ROLE,
  MEMBER_ROLE,
  NON_MEMBER_ROLE
} = require('../../schemas/AccessControlList')

const EXPECTED_ANONYMOUS_USER = {
  id: '',
  role: ANONYMOUS_ROLE
}

const EXPECTED_ID = '03615121'

const EXPECTED_MEMBER = {
  id: EXPECTED_ID,
  role: MEMBER_ROLE
}

const EXPECTED_NON_MEMBER = {
  id: EXPECTED_ID,
  firstName: 'John',
  lastName: 'Newkirk',
  primaryEmail: 'jnewkirk@pgahq.com',
  publicEmail: 'jnewkirk@pgahq.com',
  role: NON_MEMBER_ROLE
}

const certData = require('./__data__/onelogin-certs.json')
const fetchMock = jest.fn().mockResolvedValue({ data: certData })
const tokenParser = createOneloginTokenParser(fetchMock)

const createModelMock = (mapping) => ({ find: (id) => mapping[id] })
const modelMock = createModelMock({
  [EXPECTED_ID]: { id: EXPECTED_ID }
})

describe('with valid JWT token', () => {
  // Mock Date.now to 2018-01-02 to avoid expired token
  const originalDateNow = Date.now
  beforeAll(() => { Date.now = () => 1514923891000 })
  afterAll(() => { Date.now = originalDateNow })

  test('member in DDB', () => {
    const lambdaEvent = require('./__data__/event-jwt.json')
    const authenticator = createMemberAuthenticator(modelMock, tokenParser)

    return expect(authenticator(lambdaEvent))
      .resolves
      .toEqual(EXPECTED_MEMBER)
  })

  test('member not in DDB', () => {
    const lambdaEvent = require('./__data__/event-jwt.json')
    const notFoundModelMock = createModelMock({})
    const authenticator = createMemberAuthenticator(notFoundModelMock, tokenParser)

    return expect(authenticator(lambdaEvent))
      .resolves
      .toEqual(EXPECTED_NON_MEMBER)
  })

  test('unauthenticated member', () => {
    const lambdaEvent = require('./__data__/event-no-auth.json')
    const authenticator = createMemberAuthenticator(modelMock, tokenParser)

    return expect(authenticator(lambdaEvent))
      .resolves
      .toEqual(EXPECTED_ANONYMOUS_USER)
  })
})

test('no headers', () => {
  const authenticator = createMemberAuthenticator(modelMock, tokenParser)

  return expect(authenticator({}))
    .resolves
    .toEqual(EXPECTED_ANONYMOUS_USER)
})

test('invalid authorization token format', () => {
  const authenticator = createMemberAuthenticator(modelMock, tokenParser)
  const headers = { Authorization: 'Basic foobar' }

  return expect(authenticator({ headers }))
    .resolves
    .toEqual(EXPECTED_ANONYMOUS_USER)
})

test('invalid token', () => {
  const lambdaEvent = require('./__data__/event-invalid-jwt.json')
  const authenticator = createMemberAuthenticator(modelMock, tokenParser)

  return expect(authenticator(lambdaEvent))
    .rejects
    .toEqual(Error('invalid signature'))
})

test('expired token', () => {
  const lambdaEvent = require('./__data__/event-jwt.json')
  const authenticator = createMemberAuthenticator(modelMock, tokenParser)

  return expect(authenticator(lambdaEvent))
    .rejects
    .toEqual(Error('jwt expired'))
})
