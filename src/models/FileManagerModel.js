const FILE_EXPIRATION = '3600'
const FILE_SIZE_MAX = '10485760'

const mapPolicyToSchema = ({ url, fields }) => ({
  url,
  fields: {
    algorithm: fields['X-Amz-Algorithm'],
    bucket: fields['bucket'],
    credential: fields['X-Amz-Credential'],
    date: fields['X-Amz-Date'],
    key: fields['key'],
    policy: fields['Policy'],
    securityToken: fields['X-Amz-Security-Token'],
    signature: fields['X-Amz-Signature']
  }
})

module.exports = (connector, bucket) => ({
  getS3PostPolicySync: ({ key }) => {
    const params = {
      Bucket: bucket,
      Fields: { key },
      Expires: FILE_EXPIRATION,
      Conditions: [
        ['content-length-range', '1', FILE_SIZE_MAX]
      ]
    }
    return mapPolicyToSchema(connector.createPresignedPost(params))
  }
})
