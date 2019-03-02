const AccessControl = require('../../AccessControl')

test('create accesss control', () => {
  expect(() => new AccessControl()).not.toThrowError()
})

describe('addPolicy', () => {
  test('returns this for chaining', () => {
    const ac = new AccessControl()
    expect(ac.addPolicy('role', 'type', 'field', jest.fn())).toEqual(ac)
  })

  test('field is a required arg', () => {
    const ac = new AccessControl()
    expect(() => ac.addPolicy('role', 'type'))
      .toThrowError('fields must be a String or array of Strings')
  })

  test('type is a required arg', () => {
    const ac = new AccessControl()
    expect(() => ac.addPolicy('role')).toThrowError('type must be a String')
  })

  test('role is a required arg', () => {
    const ac = new AccessControl()
    expect(() => ac.addPolicy()).toThrowError('role must be a String')
  })

  test('condition must be a function', () => {
    const ac = new AccessControl()
    expect(() => ac.addPolicy('role', 'type', 'field', true))
      .toThrowError('condition must be a function')
  })

  test('duplicate condition addPolicy', () => {
    const ac = new AccessControl()
    ac.addPolicy('role', 'type', 'field', jest.fn())

    expect(() => ac.addPolicy('role', 'type', 'field', jest.fn()))
      .toThrowError(`A policy already exists for 'role.type.field'`)
  })
})

describe('getPolicy', () => {
  let ac
  beforeEach(() => { ac = new AccessControl() })

  test('addPolicy role type.field', () => {
    const expected = jest.fn()
    ac.addPolicy('role', 'type', 'field', expected)

    expect(ac.getPolicy('role', 'type', 'field')).toEqual(expected)
  })

  test('addPolicy * type.field', () => {
    const expected = jest.fn()
    ac.addPolicy('*', 'type', 'field', expected)

    expect(ac.getPolicy('role', 'type', 'field')).toEqual(expected)
  })

  test('it uses most specific condition', () => {
    const expected = jest.fn()
    const ac = new AccessControl()

    ac.allow('*', 'type', '*')
    ac.allow('*', 'type', 'field')
    ac.allow('role', 'type', '*')
    ac.addPolicy('role', 'type', 'field', expected)

    expect(ac.getPolicy('role', 'type', 'field')).toEqual(expected)
  })

  test('allow condition grants access', () => {
    const ac = new AccessControl()
    ac.allow('role', 'type', 'field')

    const condition = ac.getPolicy('role', 'type', 'field')
    return expect(condition()).resolves.toBe(true)
  })

  test('deny condition denies access', () => {
    const ac = new AccessControl()
    ac.deny('role', 'type', 'field')

    const condition = ac.getPolicy('role', 'type', 'field')
    return expect(condition()).resolves.toBe(false)
  })

  test('default policy condition resolves to true', () => {
    const ac = new AccessControl()
    const condition = ac.getPolicy('role', 'type', 'field')

    return expect(condition()).resolves.toBe(true)
  })

  test('default policy condition resolves to false for entrypoint path', () => {
    const ac = new AccessControl()
    const condition = ac.getPolicy('role', 'Query', 'field')

    return expect(condition()).resolves.toBe(false)
  })
})

describe('allow', () => {
  let ac
  beforeEach(() => { ac = new AccessControl() })

  test('accepts multiple fields', () => {
    ac.allow('role', 'Query', ['bar', 'foo'])

    const barPolicy = ac.getPolicy('role', 'Query', 'bar')
    const fooPolicy = ac.getPolicy('role', 'Query', 'foo')

    expect(barPolicy).toEqual(fooPolicy)

    return expect(barPolicy()).resolves.toBe(true)
  })
})

describe('deny', () => {
  let ac
  beforeEach(() => { ac = new AccessControl() })

  test('accepts multiple fields', () => {
    ac.deny('role', 'Query', ['bar', 'foo'])

    const barPolicy = ac.getPolicy('role', 'Query', 'bar')
    const fooPolicy = ac.getPolicy('role', 'Query', 'foo')

    expect(barPolicy).toEqual(fooPolicy)

    return expect(barPolicy()).resolves.toBe(false)
  })
})

test('getSecuredPaths', () => {
  const ac = new AccessControl()
  ac.allow('role', 'Query', ['foo', 'members', 'me'])
  ac.allow('guests', 'Member', 'email')

  const result = ac.getSecuredPaths()

  const expected = [
    'Query.foo',
    'Query.members',
    'Query.me',
    'Member.email'
  ]

  expect(result).toEqual(expected)
})

describe('secure', () => {
  let ac
  beforeEach(() => { ac = new AccessControl() })

  const obj = { id: 'obj' }
  const context = { user: { role: 'role' } }
  const expectedContext = { authorization: true, ...context }
  const args = { value: 1 }
  const info = { fieldName: 'field', parentType: 'Query' }
  const mockFn = (obj, args, context, info) => Promise.resolve({ obj, args, context, info })

  const resolvers = {
    Query: {
      field: mockFn
    },
    Member: {
      friends: mockFn
    }
  }

  test('access granted with explicit allow', () => {
    ac.allow('role', 'Query', 'field')
    const secured = ac.secure(resolvers)
    const result = secured.Query.field(obj, args, context, info)

    return expect(result)
      .resolves
      .toEqual({ obj, args, context: expectedContext, info })
  })

  test('access granted by default to root types', () => {
    const secured = ac.secure(resolvers)

    const friendsInfo = { fieldName: 'friends', parentType: 'Member' }
    return expect(secured.Member.friends(obj, args, context, friendsInfo))
      .resolves
      .toEqual({ obj, args, context: expectedContext, info: friendsInfo })
  })

  test('access denied by default to entrypoint types', () => {
    const secured = ac.secure(resolvers)

    return expect(secured.Query.field(obj, args, context, info))
      .rejects
      .toEqual(new Error(`'role' is not authorized to access 'Query.field'`))
  })

  test('access denied for field with deny', () => {
    ac.deny('role', 'Member', 'email')
    const secured = ac.secure(resolvers)

    const memberInfo = { fieldName: 'email', parentType: 'Member' }
    return expect(secured.Member.email(obj, args, context, memberInfo))
      .rejects
      .toEqual(new Error(`'role' is not authorized to access 'Member.email'`))
  })

  test('access granted for field with default resolver if condition is true', () => {
    ac.addPolicy('role', 'Member', 'primaryMobile', () => true)
    const secured = ac.secure({})
    const obj = { primaryMobile: '123456789' }
    const memberInfo = { fieldName: 'primaryMobile', parentType: 'Member' }

    return expect(secured.Member.primaryMobile(obj, args, context, memberInfo))
      .resolves
      .toEqual(obj.primaryMobile)
  })
})
