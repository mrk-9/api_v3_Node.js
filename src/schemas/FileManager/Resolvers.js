const { acl } = require('../AccessControlList')
const uuidv4 = require('uuid/v4')

acl.allow('*', 'Query', ['s3PostPolicy', 'profileImageS3Policy'])

module.exports = {
  Query: {
    s3PostPolicy (rootValue, args, context) {
      return context.JobAttachment.getS3PostPolicySync({ key: uuidv4() })
    },
    profileImageS3Policy (rootValue, args, context) {
      return context.ProfileImage.getS3PostPolicySync({ key: uuidv4() })
    }
  }
}
