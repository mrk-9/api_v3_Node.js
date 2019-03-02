const { ensureEmailOwner, ensureGreenhouseIdOwner } = require('../conditions')

const context = {
  user: {
    primaryEmail: 'mock@email.com'
  },
  Job: {
    findUserByEmail: jest.fn(() => Promise.resolve({ id: 123456 }))
  }
}

describe('AccessControlList/conditions', () => {
  test('ensureEmailOwner should return false if email not equal', () => {
    const input = { primaryEmail: 't@test.com' }
    expect(ensureEmailOwner({}, { input }, context)).toBeFalsy()
  })

  test('ensureEmailOwner should return true if email equals', () => {
    const input = { primaryEmail: context.user.primaryEmail }
    expect(ensureEmailOwner({}, { input }, context)).toBeTruthy()
  })

  test('ensureGreenhouseIdOwner should return false if greenhouse id not equal', async () => {
    const variables = { greenhouseId: 987654 }
    const expected = await ensureGreenhouseIdOwner({}, variables, context)
    expect(expected).toBeFalsy()
  })

  test('ensureGreenhouseIdOwner should return true if greenhouse id equals', async () => {
    const variables = { greenhouseId: 123456 }
    const expected = await ensureGreenhouseIdOwner({}, variables, context)
    expect(expected).toBeTruthy()
  })
})
