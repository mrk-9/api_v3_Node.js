const { GraphQLDateTime: DateTime } = require('graphql-iso-date')

const { version: currentVersion } = require('../../../package.json')
const { acl } = require('../AccessControlList')
const EmailAddress = require('./EmailAddress')
const HttpUrl = require('./HttpUrl')
const Date = require('./Iso8601Date')
const Money = require('./Money')
const NonEmptyString = require('./NonEmptyString')
const PhoneNumber = require('./PhoneNumber')

acl.allow('*', 'Query', 'version')

module.exports = {
  Query: {
    version () {
      return currentVersion
    }
  },

  DateTime,
  Date,
  EmailAddress,
  HttpUrl,
  Money,
  NonEmptyString,
  PhoneNumber
}
