const EXPECTED_JOB_FACILITY = {
  id: '334',
  userId: null,
  offices: [{
    id: '27259',
    name: 'PGAHQ',
    location: null
  }],
  hiringManager: {
    id: null,
    firstName: null,
    lastName: null,
    employeeId: null
  },
  applicantGroup: '',
  jobCategory: 'Seasonal',
  jobTitle: 'PGA Pro',
  status: 'open',
  employmentType: 'Hourly',
  yearsExperience: '2 years',
  submissionDeadline: '2018-06-28',
  baseCompensation: '14.00',
  baseCompensationMax: '55.00',
  paySchedule: '',
  additionalIncome: null,
  totalCompensation: '66.00',
  contact: {
    name: 'John Newkirk',
    title: 'PGA Pro',
    email: 'jnewkirk@pgahq.com'
  },
  education: ["bachelor's"],
  applyVia: null,
  website: 'http://website.com/',
  overview: '',
  experienceRequired: '2 years',
  responsibilities: 'Golf professional',
  benefits: 'free rounds',
  termOfServiceAgreement: false,
  currentStep: 'Completed',
  createdAt: '2018-06-14T22:59:46.160Z',
  facilities: [
    {
      id: '0017590',
      name: 'PGA National HQ',
      address: {
        address1: '100 Annandale Golf Club Dr',
        address2: 'Madison, MS  39110-8024',
        address3: 'Ste 42',
        address4: 'Bld 24',
        city: 'Kingston Springs',
        country: 'United States',
        state: 'MS',
        zip: '39110-8024'
      },
      greenhouseId: '27259'
    }
  ]
}

const EXPECTED_JOB = {
  id: '334',
  userId: null,
  offices: [{
    id: '27259',
    name: 'PGAHQ',
    location: null
  }],
  hiringManager: {
    id: null,
    firstName: null,
    lastName: null,
    employeeId: null
  },
  applicantGroup: '',
  jobCategory: 'Seasonal',
  jobTitle: 'PGA Pro',
  status: 'open',
  employmentType: 'Hourly',
  yearsExperience: '2 years',
  submissionDeadline: '2018-06-28',
  baseCompensation: '14.00',
  baseCompensationMax: '55.00',
  paySchedule: '',
  additionalIncome: null,
  totalCompensation: '66.00',
  contact: {
    name: 'John Newkirk',
    title: 'PGA Pro',
    email: 'jnewkirk@pgahq.com'
  },
  education: ["bachelor's"],
  applyVia: null,
  website: 'http://website.com/',
  overview: '',
  experienceRequired: '2 years',
  responsibilities: 'Golf professional',
  benefits: 'free rounds',
  termOfServiceAgreement: false,
  currentStep: 'Completed',
  createdAt: '2018-06-14T22:59:46.160Z'
}

const EXPECTED_JOB_APPLICATION = {
  'jobId': '622697',
  'firstName': 'JW',
  'lastName': 'Testing',
  'emailAddress': 'jason@testing.com',
  'phoneNumber': '555-555-5555',
  'website': 'http://testing.com',
  'attachments': [{
    'filename': 'testReusme.doc',
    'type': 'resume'
  }, {
    'filename': 'testCover.doc',
    'type': 'cover_letter'
  }]
}

module.exports = {
  EXPECTED_JOB,
  EXPECTED_JOB_FACILITY,
  EXPECTED_JOB_APPLICATION
}
