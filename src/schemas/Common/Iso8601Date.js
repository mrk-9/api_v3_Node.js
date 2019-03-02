const { Kind, GraphQLScalarType } = require('graphql')

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}/

const validateDate = (value) => {
  if (!DATE_REGEX.test(value)) {
    throw new TypeError(`Date '${value}' must be in YYYY-MM-DD format.`)
  }

  const date = new Date(value)

  if (Number.isNaN(date.getDate())) {
    throw new TypeError(`Date cannot represent value: ${value}`)
  }

  return value
}

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'A date in the format YYYY-MM-DD. ex: 2018-12-31',
  serialize: validateDate,
  parseValue: validateDate,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validateDate(ast.value) : undefined)
})
