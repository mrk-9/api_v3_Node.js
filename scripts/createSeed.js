const casual = require('casual')
casual.seed(42)

const Facility = require('./seeds/Facilities')
const Member = require('./seeds/Members')
const Section = require('./seeds/Sections.json')

const PaymentTypeFactory = require('../src/factory/PaymentType')
const ProductFactory = require('../src/factory/Product')
const { ADMIN_ROLE } = require('../src/schemas/AccessControlList')

const Event = Section.map(s => ({
  id: casual.uuid,
  name: `${s.name} Tournament`,
  sectionId: s.id,
  closed: false
}))

const Product = Event.map(e => ProductFactory({ eventId: e.id }))

const PaymentType = Section.map(s => PaymentTypeFactory({ sectionId: s.id }))

const Partner = [{
  id: 'arn:aws:iam::181477382365:user/lionforest',
  displayName: 'Lion Forest',
  role: ADMIN_ROLE,
  sectionId: Section[0].id
}]

const Invoice = Product.map(p => ({
  id: casual.uuid,
  invoiceNumber: `INV-${casual.integer(1111, 9999)}`,
  subtotal: '100.00',
  tax: '5.50',
  total: '105.50',
  items: [{
    productId: p.id,
    quantity: 1,
    price: '100.00',
    subtotal: '100.00',
    tax: '5.50',
    total: '105.50'
  }],
  payments: [{
    typeId: casual.random_element(PaymentType).id,
    transactionNumber: casual.integer(111111, 999999).toString(),
    amount: '105.50'
  }],
  date: casual.date(),
  invoiceUrl: 'http://www.example.com',
  createdBy: Partner[0].id
}))

console.log(JSON.stringify({
  Event,
  Facility,
  Invoice,
  Member,
  Section,
  Partner,
  Product,
  PaymentType
}, null, 2))
