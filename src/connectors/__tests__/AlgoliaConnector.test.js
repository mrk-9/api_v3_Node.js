const AlgoliaConnector = require('../AlgoliaConnector')

describe('Algolia Connector', () => {
  test('findBatch', () => {
    const clientMock = {
      initIndex: (index) => {
        return {
          getObjects: (ids) => Promise.resolve({ results: { index, ids } })
        }
      }
    }

    const connector = AlgoliaConnector(clientMock)

    return expect(connector.findBatch('index', ['1', '2']))
      .resolves
      .toEqual({
        index: 'index',
        ids: ['1', '2']
      })
  })

  test('findBatch with null args', () => {
    const clientMock = {
      initIndex: (index) => {
        return {
          getObjects: () => Promise.resolve(null)
        }
      }
    }

    const connector = AlgoliaConnector(clientMock)

    return expect(connector.findBatch('index'))
      .resolves
      .toEqual(null)
  })

  test('find', () => {
    const clientMock = {
      initIndex: (index) => {
        return {
          getObject: id => Promise.resolve({ index, id })
        }
      }
    }

    const connector = AlgoliaConnector(clientMock)

    return expect(connector.find('index', '1'))
      .resolves
      .toEqual({
        index: 'index',
        id: '1'
      })
  })

  test('findBy', () => {
    const clientMock = {
      initIndex: (index) => {
        return {
          search: (query, params) => Promise.resolve({ hits: { index, query, params }, offset: 0, length: 2, nbHits: 5 })
        }
      }
    }

    const connector = AlgoliaConnector(clientMock)

    return expect(connector.findBy('index', { params: 'params', query: 'query' }))
      .resolves
      .toEqual({
        hits: {
          index: 'index',
          query: 'query',
          params: 'params'
        },
        offset: 0,
        length: 2,
        nbHits: 5
      })
  })
})
