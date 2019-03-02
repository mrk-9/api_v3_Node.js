const { GraphQLScalarType, Kind } = require('graphql')
const { isEmail } = require('validator')

const validateEmailAddress = (value) => {
  if (isEmail(value)) {
    return value
  }

  throw new TypeError(`EmailAddress cannot represent an invalid email address: ${value}`)
}

module.exports = new GraphQLScalarType({
  name: 'EmailAddress',
  description: 'An Email Address',
  serialize: validateEmailAddress,
  parseValue: validateEmailAddress,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validateEmailAddress(ast.value) : undefined)
})
