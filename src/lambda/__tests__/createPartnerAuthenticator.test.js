const lambdaEvent = require('./__data__/event-sigv4.json')
const createPartnerAuthenticator = require('../createPartnerAuthenticator')

describe('createPartnerAuthenticator', () => {
  const EXPECTED_USER_ARN = 'arn:aws:iam::181477382365:user/circleci-apiv4'
  test('no user ARN', () => {
    const authenticator = createPartnerAuthenticator(jest.fn())

    return expect(authenticator({}))
      .rejects
      .toEqual(Error('Could not find user ARN in request!'))
  })

  test('no partner ARN in DDB', () => {
    const modelMock = { find: () => null }
    const authenticator = createPartnerAuthenticator(modelMock)

    return expect(authenticator(lambdaEvent))
      .rejects
      .toEqual(Error(`No partner associated with user ARN: '${EXPECTED_USER_ARN}'`))
  })

  test('valid partner', () => {
    const modelMock = { find: (id) => ({ id }) }
    const authenticator = createPartnerAuthenticator(modelMock)

    return expect(authenticator(lambdaEvent))
      .resolves
      .toEqual({ id: EXPECTED_USER_ARN })
  })
})
