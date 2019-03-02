const AWS = require('aws-sdk')
const { mapJobApplication } = require('./mapFromHarvestApi')

const getSignedUrl = (key, bucketName) => {
  const s3 = new AWS.S3()

  const params = {
    Bucket: bucketName,
    Key: key
  }

  return s3.getSignedUrl('getObject', params)
}

const getPhoneNumbers = number => number && { phone_numbers: [{ value: number, type: 'mobile' }] }
const getWebsite = website => website && { website_addresses: [{ value: website, type: 'personal' }] }

module.exports = (connector, bucketName) => ({
  create: async (input) => {
    const mappedData = {
      first_name: input.firstName,
      last_name: input.lastName,
      email_addresses: [{
        value: input.emailAddress,
        type: 'personal'
      }],
      applications: [{
        job_id: input.jobId,
        attachments: input.attachments.map(item => ({
          filename: item.filename,
          type: item.type,
          url: getSignedUrl(item.key, bucketName)
        }))
      }],
      ...getPhoneNumbers(input.phoneNumber),
      ...getWebsite(input.website)
    }

    return mapJobApplication(await connector.postJobApplication(mappedData))
  }
})
