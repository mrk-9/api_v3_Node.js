const casual = require('casual')

module.exports = () => ({
  address1: casual.address1,
  address2: casual.address2,
  address3: 'Ste 42',
  address4: 'Bld 24',
  city: casual.city,
  country: casual.country,
  state: casual.state,
  zip: casual.zip(5, 9)
})
