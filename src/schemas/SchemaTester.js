const { graphql } = require('graphql')
const schema = require('../schemas')

const getMethodArgs = (queryType, methodName) => {
  const type = schema.getType(queryType)
  const typeFields = type.getFields()
  const method = typeFields[methodName]

  if (method == null) {
    throw new Error(`Method '${methodName}' does not exist in schema.`)
  }

  return method.args
}

const buildQueryFields = (root, { indentLevel = 1 }) => {
  const indentation = '  '.repeat(indentLevel)

  const valueToField = (key) => {
    const keyValue = root[key]
    const value = Array.isArray(keyValue) ? keyValue[0] : keyValue

    if (value && value.constructor === Object) {
      const innerFields = buildQueryFields(value, { indentLevel: indentLevel + 1 })
      return `${key} {\n${innerFields}\n${indentation}}`
    }

    return key
  }

  const queryFields = Object.keys(root)
    .map(valueToField)
    .join(`\n${indentation}`)

  return `${indentation}${queryFields}`
}

const buildQueryVariables = args => args.map(arg => `$${arg.name}: ${arg.type}`).join(', ')

const buildMethodArgs = args => args.map(arg => `${arg.name}: $${arg.name}`).join(', ')

const buildExpectedResponse = (methodName, expected) => {
  if (expected.errors == null) {
    return { data: { [methodName]: expected } }
  }
  const errors = expected.errors
  return { data: { [methodName]: expected.returnData || null }, errors }
}

const testSchemaMethod = (queryType, methodName, { variables, expected, context, fields }) => {
  const typeDefArgs = getMethodArgs(queryType, methodName)
  // Only include args present in variables
  const queryArgs = typeDefArgs.filter(arg => variables[arg.name] !== undefined)

  const queryVariables = buildQueryVariables(queryArgs)
  const methodArgs = buildMethodArgs(queryArgs)

  const root = Array.isArray(expected) ? expected[0] : expected
  const queryFields = fields || buildQueryFields(root, { indentLevel: 2 })

  const variableParameters = queryVariables.length > 0 ? `(${queryVariables})` : ''
  const methodParameters = methodArgs.length > 0 ? `(${methodArgs})` : ''

  const query = `
${queryType.toLowerCase()} ${methodName}Test${variableParameters} {
  ${methodName}${methodParameters} {
${queryFields}
  }
}`

  return expect(graphql(schema, query, null, context, variables))
    .resolves
    .toEqual(buildExpectedResponse(methodName, expected))
}

exports.testSchemaMutation = (methodName, options) =>
  testSchemaMethod('Mutation', methodName, options)

exports.testSchemaQuery = (methodName, options) =>
  testSchemaMethod('Query', methodName, options)

exports.connectionWrap = expected => ({
  edges: [{
    node: expected,
    cursor: 'Y3Vyc29y'
  }],
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false
  }
})
