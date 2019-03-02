const decodeCursor = (cursorString) => {
  if (!cursorString) {
    return null
  }

  const decodedCursorString = Buffer.from(cursorString, 'base64').toString('ascii')
  return JSON.parse(decodedCursorString)
}

const encodeCursor = (cursor) => {
  if (!cursor) {
    return null
  }

  const cursorString = JSON.stringify(cursor)
  return Buffer.from(cursorString, 'ascii').toString('base64')
}

const paginateQuery = async (query, { limit, cursor }) => {
  const queryOptions = {
    // Request (cappedLimit + 1) items to set hasNextPage with a single scan call
    limit: limit + 1,
    cursor: decodeCursor(cursor)
  }

  const results = await query(queryOptions)

  const pageInfo = {
    hasPreviousPage: cursor != null,
    hasNextPage: results.length > limit
  }

  // Remove extra result used to determine hasNextPage
  const nodes = results.slice(0, limit)

  const nodeToEdge = node => ({ node, cursor: encodeCursor(node.cursor) })
  const edges = nodes.map(nodeToEdge)

  return { edges, pageInfo }
}

module.exports = {
  decodeCursor,
  encodeCursor,
  paginateQuery
}
