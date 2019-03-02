const { encodeCursor, decodeCursor } = require('./Pagination')

const MAX_LIMIT = 100
const capLimit = limit => Math.min(limit, MAX_LIMIT)

const buildFilters = attributes => {
  return Object
    .keys(attributes)
    .map(key => `${key}:${attributes[key]}`)
    .join(' AND ')
}

module.exports = class AlgoliaCrud {
  constructor (connector, index) {
    this.connector = connector
    this.index = index
  }

  static paginate ({ offset, length, nbHits }) {
    return hits => {
      const pageInfo = {
        hasPreviousPage: offset > 0,
        hasNextPage: length + offset < nbHits
      }

      const nodeToEdge = (node, idx) => ({ node, cursor: encodeCursor(idx + offset + 1) })
      const edges = hits.map(nodeToEdge)

      return { edges, pageInfo }
    }
  }

  find (id) {
    if (id == null) {
      return Promise.resolve(null)
    }

    return this.connector.find(this.index, id)
  }

  findBatch (ids) {
    return this.connector.findBatch(this.index, ids) || []
  }

  findBy (attributes, { first = MAX_LIMIT, after } = {}) {
    if (attributes == null) {
      return Promise.resolve([])
    }

    if (Object.keys(attributes).length === 0) {
      return this.list({ first, after })
    }

    const filters = buildFilters(attributes)

    const params = {
      filters,
      length: capLimit(first),
      offset: decodeCursor(after) || 0
    }

    return this.connector.findBy(this.index, { query: '', params })
  }

  list ({ first = MAX_LIMIT, after }) {
    const params = {
      length: capLimit(first),
      offset: decodeCursor(after) || 0
    }
    return this.connector.findBy(this.index, { query: '', params })
  }
}
