const casual = require('casual')

module.exports = () => ({
  name: casual.full_name,
  email: casual.email
})
