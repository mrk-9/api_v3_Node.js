const { GraphQLScalarType, Kind } = require('graphql')

const validateNonEmptyString = (value) => {
  if (value !== '') {
    return value
  }

  throw new TypeError('NonEmptyString cannot be empty')
}

module.exports = new GraphQLScalarType({
  name: 'NonEmptyString',
  description: 'A non-empty string.',
  serialize: validateNonEmptyString,
  parseValue: validateNonEmptyString,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validateNonEmptyString(ast.value) : undefined)
})
