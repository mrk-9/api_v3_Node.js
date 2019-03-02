const { ANONYMOUS_ROLE } = require('../AccessControlList')
const { testSchemaQuery } = require('../SchemaTester')

const contextWithMethodMock = (methodName, returnValue) => ({
  user: {
    role: ANONYMOUS_ROLE
  },
  JobAttachment: { getS3PostPolicySync: () => Promise.resolve(returnValue) },
  ProfileImage: { getS3PostPolicySync: () => Promise.resolve(returnValue) }
})

const EXPECTED_RESPONSE = {
  url: 'https://s3.amazonaws.com/pga-sandbox-job-candidate-attachments',
  fields: {
    algorithm: 'AWS4-HMAC-SHA256',
    bucket: 'pga-sandbox-job-candidate-attachments',
    credential: 'test/20180702/us-east-1/s3/aws4_request',
    date: '20180702T163358Z',
    key: '458b96d8-4bfd-4ced-ace6-1767ba857594',
    policy: 'eyJleHBpcmF0aW9uIjoiMjAxOC0wNy0wMlQxNzozMzo1OFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIjEiLCIxMDQ4NTc2MCJdLHsia2V5IjoiNDU4Yjk2ZDgtNGJmZC00Y2VkLWFjZTYtMTc2N2JhODU3NTk0In0seyJidWNrZXQiOiJwZ2Etc2FuZGJveC1qb2ItY2FuZGlkYXRlLWF0dGFjaG1lbnRzIn0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoidGVzdC8yMDE4MDcwMi91cy1lYXN0LTEvczMvYXdzNF9yZXF1ZXN0In0seyJYLUFtei1EYXRlIjoiMjAxODA3MDJUMTYzMzU4WiJ9XX0=',
    securityToken: '455//45lje4',
    signature: '2ebd3618b6b8b5ad42fe003000f91b80fca024574c1c0321629d8c71755e5248'
  }
}

test('S3 Post Policy', () => {
  return testSchemaQuery('s3PostPolicy', {
    context: contextWithMethodMock('getS3PostPolicy', EXPECTED_RESPONSE),
    expected: EXPECTED_RESPONSE
  })
})
test('profileImages3Policy', () => {
  return testSchemaQuery('profileImageS3Policy', {
    context: contextWithMethodMock('profileImageS3Policy', EXPECTED_RESPONSE),
    expected: EXPECTED_RESPONSE
  })
})
