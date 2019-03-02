const { GraphQLError } = require('graphql')

const { ADMIN_ROLE } = require('../AccessControlList')
const { connectionWrap, testSchemaMutation, testSchemaQuery } = require('../SchemaTester')

const ITEM = {
  productId: '32',
  quantity: 2,
  price: '5.00',
  subtotal: '10.00',
  tax: '2.34',
  total: '12.34'
}

const payment = {
  typeId: '64',
  transactionNumber: '5',
  amount: '12.34'
}

const INPUT = {
  invoiceNumber: '4',
  subtotal: '10.00',
  tax: '2.34',
  total: '12.34',
  items: [ITEM],
  payments: [payment],
  date: '2018-02-14',
  invoiceUrl: 'http://www.pga.org/index.html'
}

const CREATOR_ID = '123'

const EXPECTED = {
  id: '123-4',
  invoiceNumber: INPUT.invoiceNumber,
  subtotal: INPUT.subtotal,
  tax: INPUT.tax,
  total: INPUT.total,
  items: [{
    quantity: ITEM.quantity,
    product: { id: ITEM.productId },
    price: ITEM.price,
    subtotal: ITEM.subtotal,
    tax: ITEM.tax,
    total: ITEM.total
  }],
  payments: [{
    type: { id: payment.typeId },
    transactionNumber: payment.transactionNumber,
    amount: payment.amount
  }],
  date: INPUT.date,
  invoiceUrl: INPUT.invoiceUrl,
  createdBy: { id: CREATOR_ID },
  createdAt: '2018-02-14T15:52:37.378Z'
}

const EVENT = {
  id: '18AL_BMW_Cup',
  closed: false
}

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Event: { find: () => Promise.resolve(EVENT) },
  Invoice: { [methodName]: () => Promise.resolve(returnValue) },
  Partner: { find: () => Promise.resolve(EXPECTED.createdBy) },
  Product: { find: () => Promise.resolve(EXPECTED.items[0].product) },
  PaymentType: { find: () => Promise.resolve(EXPECTED.payments[0].type) }
})

test('create invoice', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    variables: { input: INPUT },
    expected: EXPECTED
  })
})

test('delete invoice', () => {
  return testSchemaMutation('deleteInvoice', {
    context: contextWithMethodMock('delete'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('create invoice', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    variables: {
      input: {
        ...INPUT,
        items: [{
          ...ITEM,
          quantity: 1,
          price: '10.00',
          subtotal: undefined
        }]
      }
    },
    expected: EXPECTED
  })
})

test('create invoice with wrong total', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, total: '0.00' } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice total does not match items total')]
    }
  })
})

test('create invoice with wrong taxes', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, tax: '0.00' } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice tax does not match items taxes')]
    }
  })
})

test('create invoice with wrong subtotal', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, subtotal: '0.00' } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice subtotal does not match items subtotal')]
    }
  })
})

test('create invoice with invalid quantity', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, items: [{ ...ITEM, quantity: -1 }] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError(`Invalid item quantity: '-1'`)]
    }
  })
})

test('create invoice with wrong item subtotal', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, items: [{ ...ITEM, quantity: 3 }] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError(`Expected '15.00' item subtotal but got '10.00'`)]
    }
  })
})

test('create invoice with wrong item total', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, items: [{ ...ITEM, total: '15.34' }] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError(`Expected '12.34' item total but got '15.34'`)]
    }
  })
})

test('create invoice with wrong payment total', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, payments: [{ ...payment, amount: '0.00' }] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice total does not match payments total')]
    }
  })
})

test('create invoice without payments', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, payments: [] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice must have one or more payments')]
    }
  })
})

test('create invoice without items', () => {
  return testSchemaMutation('createInvoice', {
    context: contextWithMethodMock('create'),
    fields: 'id',
    variables: { input: { ...INPUT, items: [] } },
    expected: {
      data: { createInvoice: null },
      errors: [new GraphQLError('Invoice must have one or more items')]
    }
  })
})

test('find invoice', () => {
  return testSchemaQuery('invoice', {
    context: contextWithMethodMock('find'),
    variables: { id: 'id' },
    expected: EXPECTED
  })
})

test('list invoices', () => {
  const expectedConnection = connectionWrap(EXPECTED)
  return testSchemaQuery('invoices', {
    context: contextWithMethodMock('findBy', expectedConnection),
    variables: { first: 10, after: 'cursor' },
    expected: expectedConnection
  })
})

test('run invoice aggregator', () => {
  const expectedResponse = { status: 202, message: 'success' }
  return testSchemaMutation('runInvoiceAggregator', {
    context: {
      user: { role: ADMIN_ROLE },
      Lambda: { run: jest.fn().mockResolvedValue(expectedResponse) }
    },
    variables: { batchDate: '2018-01-01' },
    expected: expectedResponse
  })
})
