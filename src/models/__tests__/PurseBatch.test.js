const Address = require('../../factory/Address')
const PurseBatch = require('../PurseBatch')

const TABLE_NAME = 'Test'
const ENCRYPTION_KEY = 'ABCDEFGHIJKLMNOP'

describe('PurseBatch', () => {
  test('create', async () => {
    const mockConnector = {
      create: jest.fn((table, attributes) => Promise.resolve(attributes))
    }

    const payout = {
      firstName: 'Foo',
      lastName: 'Bar',
      taxId: '2f1f1954db0d9e70b68664a0bdd541f8',
      amount: '123.45',
      memo: 'Test Transaction',
      address: Address()
    }

    const input = {
      id: 'TestBatch',
      eventId: '18AL-BMW_Cup',
      payouts: [payout]
    }

    const expected = {
      id: input.id,
      eventId: input.eventId,
      payouts: [{ ...payout }]
    }

    const model = new PurseBatch(mockConnector, TABLE_NAME, ENCRYPTION_KEY)
    const result = await model.create(input)

    expect(mockConnector.create)
      .toHaveBeenCalledWith(TABLE_NAME, expected)

    expect(result)
      .toEqual(expected)
  })

  test('check event player', () => {
    const eventPlayer = {
      firstName: 'Foo',
      lastName: 'Bar',
      taxId: '666778888',
      address: Address()
    }

    const expected = { ...eventPlayer, taxId: '2f1f1954db0d9e70b68664a0bdd541f8' }

    const model = new PurseBatch({}, TABLE_NAME, ENCRYPTION_KEY)
    expect(model.checkEventPlayer(eventPlayer))
      .toEqual(expected)
  })
})
