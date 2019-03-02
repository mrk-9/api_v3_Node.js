const { Kind } = require('graphql')

const EmailAddress = require('../EmailAddress')

describe('parseValue', () => {
  test('valid Email Address ', () => {
    expect(() => EmailAddress.parseValue('test@user.com')).not.toThrow()
  })
  test('invalid Email Address ', () => {
    expect(() => EmailAddress.parseValue('testuser.com')).toThrow()
  })
})

describe('serialize', () => {
  test('valid Email Address ', () => {
    expect(() => EmailAddress.serialize('test@user.com')).not.toThrow()
  })
  test('invalid Email Address ', () => {
    expect(() => EmailAddress.serialize('testuser.com')).toThrow()
  })
})

describe('parseLiteral', () => {
  test('string literal', () => {
    const ast = { kind: Kind.STRING, value: 'test@user.com' }
    expect(EmailAddress.parseLiteral(ast)).toBe(ast.value)
  })

  test('non string literal', () => {
    const ast = { kind: Kind.INT, value: 1223456789 }
    expect(EmailAddress.parseLiteral(ast)).toBeUndefined()
  })
})
