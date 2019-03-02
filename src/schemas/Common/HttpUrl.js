const { GraphQLScalarType, Kind } = require('graphql')
const { isURL } = require('validator')

const validateHttpUrl = (value) => {
  const httpOptions = {
    require_protocol: true
  }

  if (isURL(value, httpOptions)) {
    return value
  }

  throw new TypeError(`HttpUrl cannot represent an invalid URL: ${value}`)
}

module.exports = new GraphQLScalarType({
  name: 'HttpUrl',
  description: 'An absolute HTTP URL string starting with http or https',
  serialize: validateHttpUrl,
  parseValue: validateHttpUrl,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validateHttpUrl(ast.value) : undefined)
})
