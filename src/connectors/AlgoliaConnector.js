const AlgoliaConnector = (client) => {
  return {
    async find (indexName, objectId) {
      const index = client.initIndex(indexName)

      return index.getObject(objectId)
    },

    async findBatch (indexName, objectIds) {
      if (objectIds == null) {
        return null
      }

      const index = client.initIndex(indexName)

      const { results = [] } = await index.getObjects(objectIds)
      return results
    },

    async findBy (indexName, { params, query }) {
      const index = client.initIndex(indexName)

      const { hits = [], offset, length, nbHits } = await index.search(query, params)
      return { hits, offset, length, nbHits }
    }
  }
}

module.exports = AlgoliaConnector
