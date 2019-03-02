const { Kind } = require('graphql')

const Money = require('../Money')

describe('parseValue', () => {
  test('parse valid value', () => {
    expect(() => Money.parseValue('123456.78')).not.toThrow()
  })

  test('parse input without decimal', () => {
    expect(() => Money.parseValue('123456')).toThrow(TypeError)
  })

  test('parse negative input', () => {
    expect(() => Money.parseValue('-123456.78')).not.toThrow()
  })

  test('parse formatted value', () => {
    expect(() => Money.parseValue('123,456.78')).toThrow(TypeError)
  })
})

describe('serialize', () => {
  test('serialize valid input', () => {
    expect(() => Money.serialize('9876.45')).not.toThrow()
  })

  test('serialize input without decimal', () => {
    expect(() => Money.serialize('9876')).not.toThrow()
  })

  test('serialize without decimal should be corrected', () => {
    const res = Money.serialize('9875')
    expect(res).toEqual('9875.00')
  })

  test('serialize negative input', () => {
    expect(() => Money.serialize('-8781.78')).not.toThrow()
  })

  test('serialize formatted input', () => {
    expect(() => Money.serialize('43,426.78')).toThrow(TypeError)
  })
})

describe('parseLiteral', () => {
  test('string literal', () => {
    const ast = { kind: Kind.STRING, value: '9876.45' }
    expect(Money.parseLiteral(ast)).toBe(ast.value)
  })

  test('non string literal', () => {
    const ast = { kind: Kind.INT, value: 123 }
    expect(Money.parseLiteral(ast)).toBeUndefined()
  })
})
