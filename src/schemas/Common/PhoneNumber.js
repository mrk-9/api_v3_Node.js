const { GraphQLScalarType, Kind } = require('graphql')
const { isMobilePhone } = require('validator')

const validatePhone = (value) => {
  if (isMobilePhone(value, 'any')) {
    return value
  }

  throw new TypeError(`Invalid phone number: ${value}`)
}

module.exports = new GraphQLScalarType({
  name: 'Phone',
  description: 'A phone number including country code preceding the actual number. Ex: "12223334444" for US.',
  serialize: validatePhone,
  parseValue: validatePhone,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validatePhone(ast.value) : undefined)
})
