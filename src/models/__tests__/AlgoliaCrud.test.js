const AlgoliaCrud = require('../AlgoliaCrud')
const { encodeCursor } = require('../Pagination')

const hit = {
  objectID: '123',
  universal_id: '456',
  greenhouse_id: 'abc'
}

const hit2 = {
  objectID: '456',
  universal_id: '789',
  greenhouse_id: 'efg'
}

const mockHits = [hit, hit2]
const expectedMockHits = { hits: mockHits, offset: 0, length: 2, nbHits: 2 }

const mockConnector = {
  find: () =>
    Promise.resolve(hit),
  findBatch: ids => !ids ? [] : Promise.resolve(mockHits),
  findBy: () =>
    Promise.resolve({
      hits: mockHits,
      offset: 0,
      length: 2,
      nbHits: 2
    })
}

const connector = new AlgoliaCrud(mockConnector, 'index')

describe('Algolia CRUD', () => {
  test('find', async () => {
    const result = await connector.find('123')
    const nullResult = await connector.find(null)
    expect(result).toEqual(hit)
    expect(nullResult).toEqual(null)
  })

  describe('findBatch', () => {
    test('with args', async () => {
      const result = await connector.findBatch(['123', '456'])
      expect(result).toEqual(mockHits)
    })
    test('without args', async () => {
      const result = await connector.findBatch()
      expect(result).toEqual(mockHits)
    })
  })

  describe('list', () => {
    test('list', async () => {
      const result = await connector.list({ first: 2, after: encodeCursor(1) })
      expect(result).toEqual(expectedMockHits)
    })
    test('null after args', async () => {
      const result = await connector.list({ first: 2 })
      expect(result).toEqual(expectedMockHits)
    })
    test('empty args', async () => {
      const result = await connector.list({})
      expect(result).toEqual(expectedMockHits)
    })
  })

  describe('findBy', () => {
    test('empty attributes', async () => {
      const result = await connector.findBy({}, { first: 2, after: encodeCursor(1) })
      expect(result).toEqual(expectedMockHits)
    })
    test('empty args and null attributes', async () => {
      const result = await connector.findBy(null, {})
      expect(result).toEqual([])
    })
    test('single param', async () => {
      const result = await connector.findBy({ id: '123' }, { first: 2, after: encodeCursor(1) })
      expect(result).toEqual(expectedMockHits)
    })
    test('multiple attributes', async () => {
      const result = await connector.findBy({ id: '123', greenhouseId: 'abc' }, { first: 2, after: encodeCursor(1) })
      expect(result).toEqual(expectedMockHits)
    })
    test('null after args', async () => {
      const result = await connector.findBy({ id: '123', greenhouseId: 'abc' }, { first: 2 })
      expect(result).toEqual(expectedMockHits)
    })
    test('no args', async () => {
      const result = await connector.findBy()
      expect(result).toEqual([])
    })
  })
})
