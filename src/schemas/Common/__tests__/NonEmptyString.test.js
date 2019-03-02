const { Kind } = require('graphql')

const NonEmptyString = require('../NonEmptyString')

describe('parseValue', () => {
  test('parse valid value', () => {
    expect(() => NonEmptyString.parseValue('Some String')).not.toThrow()
  })

  test('parse empty string', () => {
    expect(() => NonEmptyString.parseValue('')).toThrow(TypeError)
  })

  test('parse space string', () => {
    expect(() => NonEmptyString.parseValue(' ')).not.toThrow()
  })

  test('parse null input', () => {
    expect(() => NonEmptyString.parseValue(null)).not.toThrow()
  })

  test('parse undefined input', () => {
    expect(() => NonEmptyString.parseValue()).not.toThrow()
  })
})

describe('serialize', () => {
  test('serialize valid input', () => {
    expect(() => NonEmptyString.serialize('another string')).not.toThrow()
  })

  test('serialize space string', () => {
    expect(() => NonEmptyString.serialize(' ')).not.toThrow()
  })

  test('serialize empty string input', () => {
    expect(() => NonEmptyString.serialize('')).toThrow(TypeError)
  })

  test('serialize null input', () => {
    expect(() => NonEmptyString.serialize(null)).not.toThrow()
  })

  test('serialize undefined input', () => {
    expect(() => NonEmptyString.serialize()).not.toThrow()
  })
})

describe('parseLiteral', () => {
  test('string literal', () => {
    const ast = { kind: Kind.STRING, value: 'Some String' }
    expect(NonEmptyString.parseLiteral(ast)).toBe(ast.value)
  })

  test('non string literal', () => {
    const ast = { kind: Kind.INT, value: 0 }
    expect(NonEmptyString.parseLiteral(ast)).toBeUndefined()
  })
})
