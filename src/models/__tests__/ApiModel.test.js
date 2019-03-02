const { ApiModel, parseMsrs, parseMemberDues } = require('../ApiModel')
const updateProfileRes = require('./__data__/updateProfileRes.json')
const updateProfileParsed = require('./__data__/updateProfileParsed.json')
const { parseMemberFields } = require('../ApiModel/mapFromApi')

const memberMsr = {
  earned: 0,
  label: 'PGA Required',
  new: '',
  recovery: '',
  required: 36
}

const memberDues = {
  dues_balance: '10.00',
  due_date: ''
}

const msrHistory = {
  category: 'ED',
  added_date: '2018-07-04',
  activity_code: 'M14',
  credits_accepted: 1,
  credits_applied_for: 1,
  description1: 'Capital budgeting and decision making',
  type: 'Member Service Requirement',
  description2: 'More description here'
}

const paths = {
  msrs: {
    membersmsrs: [memberMsr]
  },
  'msrs/status': {
    membersmsrs: [{
      cycle: {
        cohortCode: 'A',
        cycleCode: '16',
        endDate: '2021-06-15T00:00:00.000Z',
        pdpSerial: 1184120,
        startDate: '2018-06-16T00:00:00.000Z'
      },
      credits: [memberMsr]
    }]
  },
  dues: {
    membersdues: [memberDues]
  },
  'msrs/history': {
    membersmsrshistory: [msrHistory]
  },
  'profile/': (success, data, errors) => ({ success, data, errors }),
  'profile/visibility/': (success, data, errors) => ({ success, data, errors }),
  'profile/social/': (success, data, errors) => ({ success, data, errors }),
  'registration': (success, data, errors) => ({ success, errors, data: { ordernum: '12345' } })
}

const mockApiConnector = (success = true, data = {}, errors) => ({
  get: (id, path) => Promise.resolve(paths[path]),
  update: (id, path) => Promise.resolve(paths[path](success, data, errors))
})

const MEMBER_ID = '123'

const expectedMsr = {
  earned: 0,
  label: 'PGA Required',
  new: 0,
  recovery: 0,
  required: 36
}

describe('getMsr', () => {
  it('parse msr', () => {
    expect(parseMsrs([memberMsr])).toMatchObject(expect.arrayContaining([expectedMsr]))
  })

  it('cast MSR to Number', async () => {
    const msr = await ApiModel(mockApiConnector()).getMsr(MEMBER_ID)

    expect(msr).toMatchObject(expect.arrayContaining([expectedMsr]))
  })
})

describe('getmMsrHistory', () => {
  it('parse msrHistory', async () => {
    const history = await ApiModel(mockApiConnector()).getMsrHistory(MEMBER_ID)

    expect(history).toMatchObject(expect.arrayContaining([{
      category: 'ED',
      addedDate: '2018-07-04',
      activityCode: 'M14',
      creditsAccepted: 1,
      creditsAppliedFor: 1,
      description1: 'Capital budgeting and decision making',
      type: 'Member Service Requirement',
      description2: 'More description here'
    }]))
  })
})

describe('getDues', () => {
  it('parse Dues', () => {
    expect(parseMemberDues([memberDues])).toMatchObject(expect.arrayContaining([{
      duesBalance: '10.00',
      dueDate: null
    }]))
  })

  it('validates due date', async () => {
    const dues = await ApiModel(mockApiConnector()).getDues(MEMBER_ID)

    expect(dues).toMatchObject(expect.arrayContaining([{
      duesBalance: '10.00',
      dueDate: null
    }]))
  })
})

describe('getMsrStatus', () => {
  it('parse msr status', async () => {
    const msrStatus = await ApiModel(mockApiConnector()).getMsrStatus(MEMBER_ID)
    expect(msrStatus).toMatchObject(expect.objectContaining({
      cycle: {
        cohortCode: 'A',
        cycleCode: '16',
        endDate: '2021-06-15T00:00:00.000Z',
        pdpSerial: 1184120,
        startDate: '2018-06-16T00:00:00.000Z'
      },
      credits: expect.arrayContaining([expectedMsr])
    }))
  })
})

describe('update member profile', () => {
  const updateMemberProfileMethods = [
    {
      methodName: 'updateMemberProfileAttributes',
      payload: {}
    },
    {
      methodName: 'updateMemberProfileVisibility',
      payload: {}
    },
    {
      methodName: 'updateMemberProfileSocial',
      payload: {}
    }
  ]

  updateMemberProfileMethods.map(({ methodName, payload }) => {
    it('updates attributes', async () => {
      return expect(ApiModel(mockApiConnector())[methodName](MEMBER_ID, null, payload))
        .resolves
        .toMatchObject(expect.objectContaining(payload))
    })

    it('fails to update attributes', async () => {
      return expect(ApiModel(mockApiConnector(false, ['some error']))[methodName](MEMBER_ID, null, payload))
        .rejects
        .toEqual(new Error())
    })
  })
})

describe('register for Especialization', () => {
  it('creates an order for Specialization program required level', async () => {
    return expect(ApiModel(mockApiConnector()).register('39723', 'M1'))
      .resolves
      .toEqual(expect.objectContaining({
        id: '12345', product: { code: 'M1' }
      }))
  })
})

describe('MapFromApi', () => {
  it('should map correctly from api', () => {
    const id = '03615121'
    const res = parseMemberFields(updateProfileRes.data, id)
    expect(res).toEqual(updateProfileParsed)
  })
})
