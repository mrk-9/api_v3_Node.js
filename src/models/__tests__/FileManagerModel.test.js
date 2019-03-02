const FileManagerModel = require('../FileManagerModel')

describe('FileManagerModel', () => {
  it('can create S3 POST policy params for candidate attachments', () => {
    const s3ConnectorSpy = { createPresignedPost: jest.fn().mockReturnValue({
      url: 'http://testing.com',
      fields: { }
    }) }
    const bucket = 'pga-sandbox-job-candidate-attachments'
    const jobAttachments = FileManagerModel(s3ConnectorSpy, bucket)

    jobAttachments.getS3PostPolicySync({ key: 'uuid'
    })

    const [{
      Bucket,
      Fields: { key },
      Expires,
      Conditions: [ contentLength ]
    }] = s3ConnectorSpy.createPresignedPost.mock.calls[0]
    expect(Bucket).toBe('pga-sandbox-job-candidate-attachments')
    expect(key).toEqual(expect.any(String))
    expect(Expires).toBe('3600')
    expect(contentLength).toEqual(['content-length-range', '1', '10485760'])
  })
})
