const FacilityModel = require('../Facility')
const { encodeCursor } = require('../Pagination')

const hit = {
  objectID: '123',
  name: 'facility',
  phone: '(888) 888 8888',
  universal_id: '456',
  greenhouse_id: 'abc',
  section_id: '005',
  _geoloc: {
    lat: 87.991,
    lng: -32.234
  },
  updated_at: '',
  address1: 'address1',
  address2: 'address2',
  address3: 'address3',
  address4: 'address4',
  city: 'city',
  country: 'country',
  state: 'state',
  zip: 'zip'
}

const expectedHit = {
  id: '123',
  name: 'facility',
  phoneNumber: '(888) 888 8888',
  universalId: '456',
  greenhouseId: 'abc',
  sectionId: '005',
  updatedAt: '',
  address: {
    address1: 'address1',
    address2: 'address2',
    address3: 'address3',
    address4: 'address4',
    city: 'city',
    country: 'country',
    state: 'state',
    zip: 'zip'
  },
  geolocation: {
    lat: 87.991,
    lng: -32.234
  }
}

const mockHits = [hit]
const expectedMockHits = [expectedHit]
const expectedConnection = expectedMockHits.map((node, idx) => ({ node, cursor: encodeCursor(idx + 1) }))

const mockConnector = {
  find: () =>
    Promise.resolve(hit),
  findBatch: () =>
    Promise.resolve(mockHits),
  findBy: () =>
    Promise.resolve({
      hits: mockHits,
      offset: 0,
      length: 1,
      nbHits: 1
    })
}

const mockConnectorNullArgs = {
  find: () => Promise.resolve(hit),
  findBatch: () => Promise.resolve(null)
}

const Facility = FacilityModel(mockConnector)

const FacilityNullArgs = FacilityModel(mockConnectorNullArgs)

describe('Facility Model', () => {
  test('find', async () => {
    const result = await Facility.find('123')
    expect(result).toEqual(expectedHit)
  })

  test('find with null id', async () => {
    const result = await FacilityNullArgs.find(null)
    expect(result).toEqual(null)
  })

  test('findBatch', async () => {
    const result = await Facility.findBatch(['123', '456'])
    expect(result).toEqual(expectedMockHits)
  })

  test('findBatch with null ids', async () => {
    const result = await FacilityNullArgs.findBatch(null)
    expect(result).toEqual(null)
  })

  test('findBy', async () => {
    const { edges } = await Facility.findBy({}, { first: 2, after: encodeCursor(1) })
    expect(edges).toEqual(expectedConnection)
  })

  test('list', async () => {
    const { edges } = await Facility.list({ first: 2, after: encodeCursor(1) })
    expect(edges).toEqual(expectedConnection)
  })
})
