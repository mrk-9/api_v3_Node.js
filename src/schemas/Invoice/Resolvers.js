const currency = require('currency.js')
const moment = require('moment-timezone')

const { acl, ADMIN_ROLE, EVENT_PARTNER_ROLE } = require('../AccessControlList')

const ensureInvoiceCreator = async (rootValue, { id }, { user, Invoice }) => {
  const invoice = await Invoice.find(id)

  if (invoice && user.id === invoice.createdBy) {
    return true
  }

  throw new Error(`You are not authorized to access invoice '${id}'`)
}

const authorizeWithCreatedByScope = (rootValue, args, { user }) =>
  ({ scope: { createdBy: user.id } })

acl.allow(ADMIN_ROLE, 'Mutation', [
  'createInvoice',
  'runInvoiceAggregator',
  'deleteInvoice'
])
acl.allow(ADMIN_ROLE, 'Query', [
  'invoice',
  'invoices'
])

acl.allow(EVENT_PARTNER_ROLE, 'Mutation', 'createInvoice')
acl.addPolicy(EVENT_PARTNER_ROLE, 'Query', 'invoice', ensureInvoiceCreator)
acl.addPolicy(EVENT_PARTNER_ROLE, 'Query', 'invoices', authorizeWithCreatedByScope)

const validateInvoicePayments = async (invoicePayments, context) => {
  if (!invoicePayments.length) {
    throw new Error('Invoice must have one or more payments')
  }

  for (const payment of invoicePayments) {
    const type = await context.PaymentType.find(payment.typeId)

    if (!type) {
      throw new Error(`Unable to find Payment Type '${payment.typeId}'`)
    }
  }
}

const validateInvoiceItems = async (invoiceItems, context) => {
  if (!invoiceItems.length) {
    throw new Error('Invoice must have one or more items')
  }

  for (const item of invoiceItems) {
    const product = await context.Product.find(item.productId)
    if (!product) {
      throw new Error(`Unable to find Product '${item.productId}'`)
    }

    const event = await context.Event.find(product.eventId)
    if (!event || event.closed) {
      throw Error(`Unable to find open event '${product.eventId}' for product '${product.id}'!`)
    }
  }
}

const getTodaysDateYmd = () => moment.tz('America/New_York').format('YYYY-MM-DD')

const addInvoiceMetadata = async (input, context) => {
  const userId = context.user.id
  return {
    ...input,
    id: `${userId}-${input.invoiceNumber}`,
    createdBy: userId,
    source: context.user.displayName,
    batchDate: getTodaysDateYmd()
  }
}

const sumFieldAmounts = (items, key) => {
  return items
    .map(i => currency(i[key]))
    .reduce((a, b) => a.add(b), currency(0))
    .toString()
}

const validateInvoiceItem = (item) => {
  if (!item.subtotal && item.quantity === 1) {
    item.subtotal = item.price
  }

  if (item.quantity < 1) {
    throw new Error(`Invalid item quantity: '${item.quantity}'`)
  }

  const expectedSubtotal = currency(item.price).multiply(item.quantity).toString()
  if (item.subtotal !== expectedSubtotal) {
    throw new Error(`Expected '${expectedSubtotal}' item subtotal but got '${item.subtotal}'`)
  }

  const expectedTotal = currency(item.subtotal).add(currency(item.tax)).toString()
  if (item.total !== expectedTotal) {
    throw new Error(`Expected '${expectedTotal}' item total but got '${item.total}'`)
  }
}

const validateInvoiceAmounts = (invoice) => {
  invoice.items.forEach(validateInvoiceItem)

  const itemsSubtotal = sumFieldAmounts(invoice.items, 'subtotal')
  const itemsTax = sumFieldAmounts(invoice.items, 'tax')
  const itemsTotal = sumFieldAmounts(invoice.items, 'total')

  if (itemsTotal !== invoice.total) {
    throw new Error('Invoice total does not match items total')
  }

  if (itemsTax !== invoice.tax) {
    throw new Error('Invoice tax does not match items taxes')
  }

  if (itemsSubtotal !== invoice.subtotal) {
    throw new Error('Invoice subtotal does not match items subtotal')
  }

  const paymentsTotal = sumFieldAmounts(invoice.payments, 'amount')

  if (paymentsTotal !== invoice.total) {
    throw new Error('Invoice total does not match payments total')
  }
}

module.exports = {
  Mutation: {
    async createInvoice (rootValue, { input }, context) {
      await validateInvoiceItems(input.items, context)
      await validateInvoicePayments(input.payments, context)
      validateInvoiceAmounts(input)

      const inputWithMetadata = await addInvoiceMetadata(input, context)
      return context.Invoice.create(inputWithMetadata)
    },

    deleteInvoice  (rootValue, { id }, context) {
      return context.Invoice.delete(id)
    },

    runInvoiceAggregator  (rootValue, { batchDate }, context) {
      return context.Lambda.run('invoice-aggregator-run', { batchDate })
    }
  },

  Query: {
    invoice (rootValue, { id }, context) {
      return context.Invoice.find(id)
    },

    invoices (rootValue, args, context) {
      const { authorization: { scope = {} } } = context
      return context.Invoice.findBy(scope, args)
    }
  },

  Invoice: {
    createdBy (invoice, args, context) {
      return context.Partner.find(invoice.createdBy)
    }
  },

  InvoiceItem: {
    product (item, args, context) {
      return context.Product.find(item.productId)
    }
  },

  InvoicePayment: {
    type (payment, args, context) {
      return context.PaymentType.find(payment.typeId)
    }
  }
}
