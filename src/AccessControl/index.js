const setPath = require('lodash.set')
const { map, mergeDeepRight, path: getPath } = require('ramda')

const { debug } = require('@pga/logger')

const ALLOW_ACCESS = () => Promise.resolve(true)
const DENY_ACCESS = () => Promise.resolve(false)

const PATH_DELIMITER = '.'
const ENTRYPOINT_TYPES = new Set(['Query', 'Mutation', 'Subscription'])

const toArray = input => [].concat(input || [])

const FIELD_RESOLVER = (source, args, context, info) => {
  if (['object', 'function'].includes(typeof source)) {
    const property = source[info.fieldName]

    return (typeof property === 'function')
      ? property(args, context, info)
      : property
  }
}

const wrapWithAuthorizer = (authorizer, resolver) => {
  return async (obj, args, context, info) => {
    const authorization = await authorizer(obj, args, context, info)
    const enhancedContext = { authorization, ...context }
    return resolver(obj, args, enhancedContext, info)
  }
}

const buildPolicyPath = (role, type, field) => [role, type, field].join(PATH_DELIMITER)

const parsePolicyPath = (path) => {
  const [role, type, field] = path.split(PATH_DELIMITER)
  return { role, type, field }
}

const findMissingResolverPaths = (resolverPaths, resolvers) => {
  return resolverPaths.filter(pathString => {
    const path = pathString.split(PATH_DELIMITER)
    return getPath(path, resolvers) == null
  })
}

const createFieldResolvers = (resolverPaths, fieldResolver) => {
  const fieldResolvers = {}
  resolverPaths.forEach(pathString => setPath(fieldResolvers, pathString, fieldResolver))

  return fieldResolvers
}

const getDefaultPolicyForType = (type) => {
  if (ENTRYPOINT_TYPES.has(type)) {
    return DENY_ACCESS
  }

  return ALLOW_ACCESS
}

const validatePolicy = (role, type, fields, condition) => {
  if (typeof role !== 'string') {
    throw new Error('role must be a String')
  }

  if (typeof type !== 'string') {
    throw new Error('type must be a String')
  }

  if (typeof fields !== 'string' && !Array.isArray(fields)) {
    throw new Error('fields must be a String or array of Strings')
  }

  if (typeof condition !== 'function') {
    throw new Error('condition must be a function')
  }
}

const createAuthorizer = (accessControl) => {
  return async (obj, args, context, info) => {
    const { user: { role } } = context
    const { parentType, fieldName } = info

    const type = parentType.toString()
    const policy = accessControl.getPolicy(role, type, fieldName)

    const authorization = await policy(obj, args, context, info)

    if (!authorization) {
      throw new Error(`'${role}' is not authorized to access '${type}.${fieldName}'`)
    }

    debug(`'${role}.${type}.${fieldName}' authorized with`, authorization)
    return authorization
  }
}

class AccessControl {
  constructor () {
    this.policies = {}
  }

  addPolicy (role, type, fields, condition) {
    validatePolicy(role, type, fields, condition)

    toArray(fields).forEach(field => {
      const policyPath = buildPolicyPath(role, type, field)

      if (this.policies[policyPath]) {
        throw new Error(`A policy already exists for '${role}.${type}.${field}'`)
      }

      this.policies[policyPath] = condition
    })

    return this
  }

  allow (role, type, fields) {
    return this.addPolicy(role, type, fields, ALLOW_ACCESS)
  }

  deny (role, type, fields) {
    return this.addPolicy(role, type, fields, DENY_ACCESS)
  }

  getPolicy (role, type, field) {
    const rolePolicyPath = buildPolicyPath(role, type, field)

    debug(`Finding policy for '${rolePolicyPath}'`)
    const policy = this.policies[rolePolicyPath]

    if (policy) {
      debug(`Using policy '${rolePolicyPath}': ${policy.name}`)
      return policy
    }

    const allRolesPolicyPath = buildPolicyPath('*', type, field)
    const allRolesPolicy = this.policies[allRolesPolicyPath]

    if (allRolesPolicy) {
      debug(`Using policy '${allRolesPolicyPath}': ${allRolesPolicy.name}`)
      return allRolesPolicy
    }

    const defaultPolicy = getDefaultPolicyForType(type)

    debug(`Using default policy for '${type}': ${defaultPolicy.name}`)
    return defaultPolicy
  }

  getSecuredPaths () {
    const policyPaths = Object.keys(this.policies)

    const resolverPaths = policyPaths.map(path => {
      const { type, field } = parsePolicyPath(path)
      return [type, field].join(PATH_DELIMITER)
    })

    // Return unique paths
    return Array.from(new Set(resolverPaths))
  }

  secure (resolvers) {
    const securedPaths = this.getSecuredPaths()

    // Find fields that have a policy but use default field resolver
    const missingResolverPaths = findMissingResolverPaths(securedPaths, resolvers)

    debug('Creating field resolvers:', missingResolverPaths)
    const missingFieldResolvers = createFieldResolvers(missingResolverPaths, FIELD_RESOLVER)
    const enhancedResolvers = mergeDeepRight(missingFieldResolvers, resolvers)

    const authorizer = createAuthorizer(this)
    const createSecureResolver = (resolver) =>
      // Only secure function resolvers not Scalar resolvers
      (typeof resolver === 'function' ? wrapWithAuthorizer(authorizer, resolver) : resolver)

    return map(type => map(createSecureResolver, type), enhancedResolvers)
  }
}

module.exports = AccessControl
