const moment = require('moment')
const { merge } = require('ramda')
const { triggerUpdate } = require('./sb')
const { parseMemberFields } = require('./mapFromApi')
const parseDate = date => moment(date).isValid() ? new Date(date).toISOString() : null

const parseMsrs = membersmsrs => membersmsrs.map(msr => ({
  required: Number(msr.required),
  label: msr.label,
  earned: Number(msr.earned),
  recovery: Number(msr.recovery),
  new: Number(msr.new)
}))

const parseMsrsStatus = ([{credits, cycle}]) => ({
  cycle: merge(cycle, { startDate: parseDate(cycle.startDate) }),
  credits: parseMsrs(credits)
})

const parseMemberDues = membersdues => membersdues.map(due => ({
  duesBalance: due.dues_balance,
  dueDate: parseDate(due.due_date)
}))

const parseMsrHistory = msrHistory => msrHistory.map(entry => ({
  addedDate: entry.added_date,
  activityCode: entry.activity_code,
  creditsAccepted: entry.credits_accepted,
  creditsAppliedFor: entry.credits_applied_for,
  category: entry.category,
  description1: entry.description1,
  type: entry.type,
  description2: entry.description2
}))

const NOT_FOUND_STATUSES = [400, 404]
const parseApiError = (err) => {
  if (err.response && NOT_FOUND_STATUSES.includes(err.response.status)) {
    return null
  }
  throw err
}

const updateMemberProfile = (connector, resource) => async (id, uid, payload) => {
  const { success, data, errors } = await connector.update(id, resource, {
    ...payload,
    uid
  })
  if (!success) {
    throw new Error(errors)
  }
  await triggerUpdate('members', uid)
  return data.data ? parseMemberFields(data.data, id) : payload
}

const ApiModel = connector => ({
  getMsr (id) {
    return connector.get(id, 'msrs')
      .then(({ membersmsrs }) => parseMsrs(membersmsrs))
      .catch(parseApiError)
  },

  getMsrStatus (id) {
    return connector.get(id, 'msrs/status')
      .then(({ membersmsrs }) => parseMsrsStatus(membersmsrs))
      .catch(parseApiError)
  },

  getMsrHistory (id) {
    return connector.get(id, 'msrs/history')
      .then(({ membersmsrshistory }) => parseMsrHistory(membersmsrshistory))
      .catch(parseApiError)
  },

  getDues (id) {
    return connector.get(id, 'dues')
      .then(({ membersdues }) => parseMemberDues(membersdues))
      .catch(parseApiError)
  },

  updateMemberProfileVisibility: updateMemberProfile(connector, 'profile/visibility/'),

  updateMemberProfileSocial: updateMemberProfile(connector, 'profile/social/'),

  updateMemberProfileAttributes: updateMemberProfile(connector, 'profile/'),

  register (id, productCode) {
    return connector.update(id, `registration`, {
      product_id: productCode
    })
      .then(({ data: { ordernum }, errors }) => {
        if (errors) {
          throw new Error(errors)
        }
        return { id: ordernum, product: { code: productCode } }
      })
      .catch(parseApiError)
  }
})

module.exports = {
  ApiModel,
  parseMemberDues,
  parseMsrs,
  parseMsrHistory
}
