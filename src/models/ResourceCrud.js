const DataLoader = require('dataloader')

const { paginateQuery } = require('./Pagination')

const MAX_LIMIT = 100
const capLimit = limit => Math.min(limit, MAX_LIMIT)

const orderById = (ids, items) => {
  const idToItem = {}

  items.forEach((item) => {
    idToItem[item.id] = item
  })

  return ids.map(id => idToItem[id])
}

module.exports = class ResourceCrud {
  constructor (connector, table) {
    this.connector = connector
    this.table = table
    this.loader = new DataLoader(this.findBatch.bind(this))
  }

  create (attributes) {
    return this.connector.create(this.table, attributes)
  }

  delete (id) {
    if (id == null) {
      return Promise.resolve(null)
    }

    return this.connector.remove(this.table, id)
  }

  find (id) {
    if (id == null) {
      return Promise.resolve(null)
    }

    return this.loader.load(id)
  }

  async findBatch (ids) {
    const items = await this.connector.findBatch(this.table, ids) || []

    // Ensure items match order of ids
    return orderById(ids, items)
  }

  findBy (attributes, { first = MAX_LIMIT, after } = {}) {
    if (attributes == null) {
      return Promise.resolve([])
    }

    if (Object.keys(attributes).length === 0) {
      return this.list({ first, after })
    }

    const cappedLimit = capLimit(first)
    const query = options => this.connector.findBy(this.table, attributes, options)

    return paginateQuery(query, { limit: cappedLimit, cursor: after })
  }

  list ({ first = MAX_LIMIT, after }) {
    const cappedLimit = capLimit(first)
    const query = options => this.connector.all(this.table, options)

    return paginateQuery(query, { limit: cappedLimit, cursor: after })
  }

  softDelete (id) {
    return this.update(id, { isDeleted: true })
  }

  update (id, attributes) {
    if (id == null || attributes == null) {
      return Promise.resolve(null)
    }

    return this.connector.update(this.table, id, attributes)
  }
}
