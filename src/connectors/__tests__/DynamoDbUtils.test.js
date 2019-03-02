const {
  buildExpressionAction,
  buildUpdateExpression,
  buildExpressionAttributeValues,
  buildExpressionAttributeNames
} = require('../DynamoDbUtils')

const TEST_ATTRIBUTES = {
  a: 'foo',
  b: 'bar'
}

test('buildExpressionAction', () => {
  expect(buildExpressionAction('test')).toBe('#test = :test')
})

test('buildUpdateExpression', () => {
  expect(buildUpdateExpression(TEST_ATTRIBUTES)).toBe('SET #a = :a, #b = :b')
})

test('buildExpressionAttributeValues', () => {
  const expected = {
    ':a': 'foo',
    ':b': 'bar'
  }

  expect(buildExpressionAttributeValues(TEST_ATTRIBUTES)).toEqual(expected)
})

test('buildExpressionAttributeNames', () => {
  const expected = {
    '#a': 'a',
    '#b': 'b'
  }

  expect(buildExpressionAttributeNames(TEST_ATTRIBUTES)).toEqual(expected)
})
