const {
  encodeCursor,
  decodeCursor,
  paginateQuery
} = require('../Pagination')

test('test cursor encode and decode', () => {
  const cursor = 'cursor'
  const encoded = encodeCursor(cursor)
  const decoded = decodeCursor(encoded)

  expect(decoded).toEqual(cursor)
})

test('test cursor encode with null', () => {
  expect(encodeCursor(null)).toBeNull()
})

test('test cursor decode with null', () => {
  expect(decodeCursor(null)).toBeNull()
})

test('paginate query', async () => {
  const firstResult = { id: '1', cursor: { id: '1' } }
  const secondResult = { id: '2', cursor: { id: '2' } }

  const queryMock = jest.fn().mockReturnValue(Promise.resolve([firstResult, secondResult]))

  const expected = {
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    },
    edges: [{
      node: firstResult,
      cursor: encodeCursor(firstResult.cursor)
    }]
  }

  const connection = await paginateQuery(queryMock, { limit: 1 })
  expect(queryMock).toBeCalledWith({ limit: 2, cursor: null })
  expect(connection).toEqual(expected)
})
