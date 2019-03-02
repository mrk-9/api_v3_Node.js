const ResourceCrud = require('../ResourceCrud')
const { encodeCursor } = require('../Pagination')

const INPUT = { id: '123', name: 'foo' }
const CURSOR = encodeCursor('cursor')
const LIMIT = 1000
const TABLE = 'Table'
const ID = 'id'

const createResource = (connectorMock = {}) => new ResourceCrud(connectorMock, TABLE)

test('list', () => {
  const mockAll = jest.fn().mockReturnValue(Promise.resolve([INPUT]))

  const connectorMock = { all: mockAll }
  const resource = createResource(connectorMock)
  return resource.list({ first: LIMIT, after: CURSOR })
    .then(() => {
      expect(mockAll)
        .toHaveBeenCalledWith(TABLE, { limit: 101, cursor: 'cursor' })
    })
})

test('create', () => {
  const connectorMock = { create: jest.fn() }
  const resource = createResource(connectorMock)
  resource.create(INPUT)

  expect(connectorMock.create).toHaveBeenCalledWith(TABLE, INPUT)
})

test('delete', () => {
  const connectorMock = { remove: jest.fn() }
  const resource = createResource(connectorMock)
  resource.delete(ID)

  expect(connectorMock.remove).toHaveBeenCalledWith(TABLE, ID)
})

test('delete null id', () => {
  const connectorMock = { remove: jest.fn() }
  const resource = createResource(connectorMock)

  return expect(resource.delete(null)).resolves.toBeNull()
})

test('find', async () => {
  const connectorMock = { findBatch: jest.fn().mockReturnValue(Promise.resolve([{ id: ID }])) }
  const resource = createResource(connectorMock)
  await resource.find(ID)

  expect(connectorMock.findBatch).toHaveBeenCalledWith(TABLE, [ID])
})

test('find null id', () => {
  const connectorMock = { find: jest.fn().mockReturnValue(Promise.resolve(null)) }
  const resource = createResource(connectorMock)

  return expect(resource.find()).resolves.toBeNull()
})

test('findBatch', async () => {
  const mockItems = [{ id: 2 }, { id: 3 }, { id: 1 }]
  const connectorMock = { findBatch: jest.fn().mockReturnValue(mockItems) }
  const resource = createResource(connectorMock)
  const result = await resource.findBatch([3, 1, 2])

  expect(result).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }])
})

test('findBy', () => {
  const mockFindBy = jest.fn().mockReturnValue(Promise.resolve([INPUT]))
  const resource = createResource({ findBy: mockFindBy })

  return resource.findBy({ sectionId: 'id' }, { first: LIMIT })
    .then(() => {
      expect(mockFindBy)
        .toHaveBeenCalledWith(TABLE, { sectionId: 'id' }, { limit: 101, cursor: null })
    })
})

test('findBy', () => {
  const mockFindBy = jest.fn().mockReturnValue(Promise.resolve([INPUT]))
  const resource = createResource({ all: mockFindBy })

  return resource.findBy({}, { first: LIMIT })
    .then(() => {
      expect(mockFindBy)
        .toHaveBeenCalledWith(TABLE, { limit: 101, cursor: null })
    })
})

test('findBy null attributes', () => {
  const resource = createResource({})
  return expect(resource.findBy(null)).resolves.toEqual([])
})

test('softDelete', () => {
  const connectorMock = { update: jest.fn() }
  const resource = createResource(connectorMock)
  resource.softDelete(ID)

  expect(connectorMock.update).toHaveBeenCalledWith(TABLE, ID, { isDeleted: true })
})

test('update', () => {
  const connectorMock = { update: jest.fn() }
  const resource = createResource(connectorMock)
  resource.update(ID, INPUT)

  expect(connectorMock.update).toHaveBeenCalledWith(TABLE, ID, INPUT)
})

test('update without attributes', () => {
  const connectorMock = { update: jest.fn() }
  const resource = createResource(connectorMock)

  return expect(resource.update(ID, null)).resolves.toBeNull()
})
