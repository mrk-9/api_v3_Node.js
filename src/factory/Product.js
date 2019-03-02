const casual = require('casual')

const AccountId = require('./AccountId')
const ProjectAccount = require('./ProjectAccount')

module.exports = (fields) => ({
  id: casual.uuid,
  name: 'Foo Bars',
  eventId: casual.uuid,
  ledgerId: casual.integer(900000, 1000000).toString(),
  revenueAccountId: AccountId(),
  taxAccountId: AccountId(),
  projectAccount: ProjectAccount(),
  ...fields
})
