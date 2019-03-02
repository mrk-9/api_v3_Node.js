const { compose, map, pickBy } = require('ramda')
const AlgoliaCrud = require('./AlgoliaCrud')

const ALGOLIA_FACILITY_INDEX = 'MemberFacilityDirectory'

const mapFacility = facility => ({
  id: facility.objectID,
  name: facility.name,
  phoneNumber: facility.phone,
  universalId: facility.universal_id,
  sectionId: facility.section_id,
  greenhouseId: facility.greenhouse_id,
  updatedAt: facility.updated_at,
  address: {
    address1: facility.address1,
    address2: facility.address2,
    address3: facility.address3,
    address4: facility.address4,
    city: facility.city,
    country: facility.country,
    state: facility.state,
    zip: facility.zip
  },
  geolocation: facility._geoloc
})

const valueExists = val => !!val

const mapAttributesToAlgolia = attributes => pickBy(valueExists, {
  objectID: attributes.id,
  name: attributes.name,
  universal_id: attributes.universalId,
  section_id: attributes.sectionId,
  greenhouse_id: attributes.greenhouseId,
  facility_id: attributes.facilityId,
  object_type: 'Facility'
})

module.exports = connector => {
  const client = new AlgoliaCrud(connector, ALGOLIA_FACILITY_INDEX)

  return {
    async find (id) {
      const result = await client.find(id)
      return result ? mapFacility(result) : result
    },

    async findBatch (ids) {
      const result = await client.findBatch(ids)
      return result ? result.map(mapFacility) : result
    },

    async findBy (attributes, args) {
      const { hits, ...rest } = await client.findBy(mapAttributesToAlgolia(attributes), args)
      return compose(AlgoliaCrud.paginate(rest), map(mapFacility))(hits)
    },

    async list (args) {
      const { hits, ...rest } = await client.list(args)
      return compose(AlgoliaCrud.paginate(rest), map(mapFacility))(hits)
    }
  }
}
