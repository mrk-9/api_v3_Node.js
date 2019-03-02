const { GraphQLScalarType, Kind } = require('graphql')
const { isCurrency } = require('validator')

const validateMoney = (value) => {
  const CURRENCY_OPTIONS = {
    allow_negatives: true,
    require_decimal: true,
    thousands_separator: ''
  }

  if (isCurrency(value, CURRENCY_OPTIONS)) {
    return value
  }

  throw new TypeError(`Money cannot represent invalid value: ${value}`)
}

module.exports = new GraphQLScalarType({
  name: 'Money',
  description: 'An unformatted monetary value string with 2 decimal places. Ex: "1234.00"',
  serialize: num => {
    const moneyString = Number(num).toFixed(2).toString()
    return validateMoney(moneyString)
  },
  parseValue: validateMoney,
  parseLiteral: ast => (ast.kind === Kind.STRING ? validateMoney(ast.value) : undefined)
})
