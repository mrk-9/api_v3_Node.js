const HarvestApiConnector = require('../../connectors/HarvestApiConnector')
const JobApplicationModel = require('../JobApplicationModel')

const mockConnection = ({ userId }) => ({ method, endpoint, data }) => {
  switch (endpoint) {
    case 'candidates':
      return Promise.resolve({
        first_name: 'JW',
        last_name: 'Testing',
        attachments: [{
          filename: 'testReusme.doc',
          type: 'resume',
          url: 'https://greenhouse-sandbox.s3.amazonaws.com/person_attachments/data/110/212/707/original/testReusme.doc?AWSAccessKeyId=AKIAJAXMMGAFSNXACBSQ&Expires=1533410963&Signature=ywtCE7EDvjJB59V%2FIdK%2FEhrI7p4%3D'
        }]
      })
  }
}

const INPUT = {
  'jobId': '622697',
  'firstName': 'JW',
  'lastName': 'Testing',
  'emailAddress': 'jason@testing.com',
  'phoneNumber': '555-555-5555',
  'website': 'http://testing.com',
  'attachments': [{
    'key': 'bea3e819-8121-4499-9765-be9ffe107a8b',
    'filename': 'testReusme.doc',
    'url': 'https://s3.amazonaws.com/pga-sandbox-job-candidate-attachments/bea3e819-8121-4499-9765-be9ffe107a8b',
    'type': 'resume'
  }, {
    'key': 'bea3e819-8121-4499-9765-be9ffe107a8b',
    'filename': 'testCover.doc',
    'url': 'https://s3.amazonaws.com/pga-sandbox-job-candidate-attachments/bea3e819-8121-4499-9765-be9ffe107a8b',
    'type': 'cover_letter'
  }]
}

const EXPECTED = {
  'applicationId': undefined,
  'firstName': 'JW',
  'lastName': 'Testing',
  'emailAddress': undefined,
  'phoneNumber': undefined,
  'website': undefined,
  'attachments': [
    {
      'filename': 'testReusme.doc',
      'type': 'resume',
      'url': 'https://greenhouse-sandbox.s3.amazonaws.com/person_attachments/data/110/212/707/original/testReusme.doc?AWSAccessKeyId=AKIAJAXMMGAFSNXACBSQ&Expires=1533410963&Signature=ywtCE7EDvjJB59V%2FIdK%2FEhrI7p4%3D'
    }
  ]
}

describe('JobApplicationModel', () => {
  const model = JobApplicationModel(
    HarvestApiConnector({ connection: mockConnection({ userId: 786605 }) }),
    'mockedBucket'
  )

  it('can save a job application', () => {
    return expect(model.create(INPUT))
      .resolves
      .toEqual(EXPECTED)
  })
})
