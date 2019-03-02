const casual = require('casual')

module.exports = () => ({
  phone: casual.phone,
  fullName: casual.full_name,
  photo: casual.url,
  email: 'consultant@example.com'
})
