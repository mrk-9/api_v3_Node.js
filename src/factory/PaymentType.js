const casual = require('casual')

const AccountId = require('./AccountId')

module.exports = (fields) => ({
  id: casual.uuid,
  name: `${casual.card_type}-${casual.integer(1111, 9999)}`,
  sectionId: casual.integer(100, 300).toString(),
  ledgerId: casual.integer(900000, 1000000).toString(),
  clearingAccountId: AccountId(),
  ...fields
})
