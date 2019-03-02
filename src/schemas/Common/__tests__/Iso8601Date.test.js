const { Kind } = require('graphql')

const Iso8601Date = require('../Iso8601Date')

describe('parseValue', () => {
  test('valid date', () => {
    expect(() => Iso8601Date.parseValue('2018-03-09')).not.toThrow(TypeError)
  })

  test('valid date in wrong format', () => {
    expect(() => Iso8601Date.parseValue('03/09/2018')).toThrow(TypeError)
  })

  test('valid format with invalid', () => {
    expect(() => Iso8601Date.parseValue('2018-13-15')).toThrow(TypeError)
  })
})

describe('serialize', () => {
  test('valid date', () => {
    expect(() => Iso8601Date.serialize('2020-07-04')).not.toThrow(TypeError)
  })

  test('valid date in wrong format', () => {
    expect(() => Iso8601Date.serialize('04/12/2001')).toThrow(TypeError)
  })

  test('valid format with invalid', () => {
    expect(() => Iso8601Date.serialize('1975-12-32')).toThrow(TypeError)
  })
})

describe('parseLiteral', () => {
  test('valid string literal', () => {
    const ast = { value: '1910-12-13', kind: Kind.STRING }
    expect(Iso8601Date.parseLiteral(ast)).toBe(ast.value)
  })

  test('invalid literal format', () => {
    const ast = { value: 19101213, kind: Kind.INT }
    expect(Iso8601Date.parseLiteral(ast)).toBeUndefined()
  })
})
