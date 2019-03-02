const { acl, ADMIN_ROLE } = require('../AccessControlList')

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createProduct',
  'updateProduct',
  'deleteProduct'
])
acl.allow(ADMIN_ROLE, 'Query', [
  'product',
  'products'
])

module.exports = {
  Mutation: {
    createProduct (rootValue, { input }, context) {
      return context.Product.create(input)
    },

    updateProduct (rootValue, { id, input }, context) {
      return context.Product.update(id, input)
    },

    deleteProduct (rootValue, { id }, context) {
      return context.Product.delete(id)
    }
  },

  Query: {
    product (rootValue, { id }, context) {
      return context.Product.find(id)
    },

    products (rootValue, args, context) {
      return context.Product.list(args)
    }
  },

  Product: {
    event (product, args, context) {
      return context.Event.find(product.eventId)
    }
  }
}
