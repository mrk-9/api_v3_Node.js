---
to: src/schemas/<%=h.inflection.camelize(name)%>/Resolvers.js
---
const { acl, ADMIN_ROLE, MEMBER_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', [
  'create<%=h.inflection.camelize(name)%>',
  'update<%=h.inflection.camelize(name)%>',
  'delete<%=h.inflection.camelize(name)%>'
])

acl.allow(ADMIN_ROLE, 'Query', [
  '<%=h.inflection.camelize(name, true)%>',
  '<%=h.inflection.pluralize(h.inflection.camelize(name, true))%>'
])

module.exports = {
  Mutation: {
    create<%=h.inflection.camelize(name)%> (rootValue, { input }, context) {
      return context.<%=h.inflection.camelize(name)%>.create(input)
    },

    update<%=h.inflection.camelize(name)%> (rootValue, { id, input }, context) {
      return context.<%=h.inflection.camelize(name)%>.update(id, input)
    },

    delete<%=h.inflection.camelize(name)%> (rootValue, { id }, context) {
      return context.<%=h.inflection.camelize(name)%>.delete(id)
    }
  },

  Query: {
    <%=h.inflection.camelize(name, true)%> (rootValue, { id }, context) {
      return context.<%=h.inflection.camelize(name)%>.find(id)
    },

    <%=h.inflection.pluralize(h.inflection.camelize(name, true))%> (rootValue, { first, after }, context) {
      return context.<%=h.inflection.camelize(name)%>.list({ first, after })
    }
  }
}
