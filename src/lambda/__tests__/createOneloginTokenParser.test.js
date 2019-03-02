const fs = require('fs')

const createOneloginTokenParser = require('../createOneloginTokenParser')

const loadData = (filename) => fs.readFileSync(`${__dirname}/__data__/${filename}`, 'utf-8')

const createFetchMock = (mapping) => (url) => ({ data: mapping[url] })

describe('valid token', () => {
  // Mock Date.now to 2018-01-02 to avoid expired token
  const originalDateNow = Date.now
  beforeAll(() => { Date.now = () => 1514923891000 })
  afterAll(() => { Date.now = originalDateNow })

  const JWT_TOKEN = loadData('jwt.token')
  const BAD_JWT_TOKEN = loadData('bad-jwt.token')

  const EXPECTED_PROFILE = require('./__data__/jwt-payload.json')

  const ONELOGIN_URL = 'https://openid-connect.onelogin.com/oidc/certs'
  const MAPPING = { [ONELOGIN_URL]: require('./__data__/onelogin-certs.json') }
  const fetchMock = createFetchMock(MAPPING)

  test('null token', () => {
    const tokenParser = createOneloginTokenParser(fetchMock, {})

    return expect(tokenParser())
      .resolves
      .toBeNull()
  })

  test('valid token', () => {
    const tokenParser = createOneloginTokenParser(fetchMock, {})

    return expect(tokenParser(JWT_TOKEN))
      .resolves
      .toEqual(EXPECTED_PROFILE)
  })

  test('invalid token', () => {
    const tokenParser = createOneloginTokenParser(fetchMock, {})

    return expect(tokenParser(BAD_JWT_TOKEN))
      .rejects
      .toEqual(Error('Unable to decode JWT token'))
  })

  test('valid token with cached key', () => {
    const tokenParser = createOneloginTokenParser(fetchMock)

    return expect(tokenParser(JWT_TOKEN))
      .resolves
      .toEqual(EXPECTED_PROFILE)
  })

  test('invalid key ID', () => {
    const fetchMock = createFetchMock({
      [ONELOGIN_URL]: { keys: [] }
    })
    const tokenParser = createOneloginTokenParser(fetchMock, {})

    return expect(tokenParser(JWT_TOKEN))
      .rejects
      .toEqual(Error(`Invalid token Key ID: 'JRcO4nxs5jgc8YdN7I2hLO4V_ql1bdoiMXmcYgHm4Hs'`))
  })
})
