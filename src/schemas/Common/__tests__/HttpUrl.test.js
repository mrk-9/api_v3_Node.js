const { Kind } = require('graphql')

const HttpUrl = require('../HttpUrl')

describe('parseValue', () => {
  test('parse valid http URL', () => {
    expect(() => HttpUrl.parseValue('http://www.pga.org/index.html')).not.toThrow()
  })

  test('parse valid https URL', () => {
    expect(() => HttpUrl.parseValue('https://www.pga.org/index.html')).not.toThrow()
  })

  test('parse URL without protocol', () => {
    expect(() => HttpUrl.parseValue('//www.pga.org/index.html')).toThrow()
  })

  test('parse URL without subdomain', () => {
    expect(() => HttpUrl.parseValue('http://pga.org/index.html')).not.toThrow(TypeError)
  })

  test('parse invalid protocol URL', () => {
    expect(() => HttpUrl.parseValue('ssh://www.pga.org/index.html')).toThrow(TypeError)
  })

  test('parse URL without TLD', () => {
    expect(() => HttpUrl.parseValue('http://pga/index.html')).toThrow(TypeError)
  })

  test('parse URL without slash', () => {
    expect(() => HttpUrl.parseValue('http:/www.pga.org/index.html')).toThrow(TypeError)
  })
})

describe('parseLiteral', () => {
  test('string literal', () => {
    const ast = { value: 'http://www.pga.org/index.html', kind: Kind.STRING }
    expect(HttpUrl.parseLiteral(ast)).toBe(ast.value)
  })

  test('non string literal', () => {
    const ast = { value: 123, kind: Kind.INT }
    expect(HttpUrl.parseLiteral(ast)).toBeUndefined()
  })
})

describe('serialize', () => {
  test('serialize valid http URL', () => {
    expect(() => HttpUrl.serialize('http://www.pga.org/index.html')).not.toThrow()
  })

  test('serialize valid https URL', () => {
    expect(() => HttpUrl.serialize('https://www.pga.org/index.html')).not.toThrow()
  })

  test('serialize URL without subdomain', () => {
    expect(() => HttpUrl.serialize('http://pga.org/')).not.toThrow(TypeError)
  })

  test('serialize invalid protocol URL', () => {
    expect(() => HttpUrl.serialize('ssh://www.pga.org/index.html')).toThrow(TypeError)
  })

  test('serialize URL without TLD', () => {
    expect(() => HttpUrl.serialize('http://pga/index.html')).toThrow(TypeError)
  })

  test('serialize URL without slash', () => {
    expect(() => HttpUrl.serialize('http:/www.pga.org/index.html')).toThrow(TypeError)
  })
})
