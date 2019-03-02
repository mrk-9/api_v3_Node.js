const { Kind } = require('graphql')

const PhoneNumber = require('../PhoneNumber')

describe('parseValue', () => {
  test('valid US number', () => {
    expect(() => PhoneNumber.parseValue('19876543210')).not.toThrow()
  })

  test('valid international number', () => {
    expect(() => PhoneNumber.parseValue('551223456789')).not.toThrow()
  })

  test('invalid number', () => {
    expect(() => PhoneNumber.serialize('1GHOSTBUSTERS')).toThrow()
  })
})

describe('serialize', () => {
  test('valid US number', () => {
    expect(() => PhoneNumber.serialize('19876543210')).not.toThrow()
  })

  test('valid international number', () => {
    expect(() => PhoneNumber.serialize('551223456789')).not.toThrow()
  })

  test('invalid number', () => {
    expect(() => PhoneNumber.serialize('1800CALLSAL')).toThrow()
  })
})

describe('parseLiteral', () => {
  test('string literal', () => {
    const ast = { kind: Kind.STRING, value: '19876543210' }
    expect(PhoneNumber.parseLiteral(ast)).toBe(ast.value)
  })

  test('non string literal', () => {
    const ast = { kind: Kind.INT, value: 1223456789 }
    expect(PhoneNumber.parseLiteral(ast)).toBeUndefined()
  })
})
