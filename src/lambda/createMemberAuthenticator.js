const { info } = require('@pga/logger')

const createOneloginTokenParser = require('./createOneloginTokenParser')
const { ANONYMOUS_ROLE, MEMBER_ROLE, NON_MEMBER_ROLE } = require('../schemas/AccessControlList')

const getAuthorizationToken = (headers) => {
  if (!headers) {
    return null
  }

  const bearerToken = headers.Authorization || headers.authorization || ''
  const [, token] = bearerToken.match(/^bearer\s+(.+)$/i) || []
  return token
}

const buildMemberFromProfile = (profile) => ({
  id: profile.title || '',
  firstName: profile.given_name,
  lastName: profile.family_name,
  primaryEmail: profile.email,
  publicEmail: profile.email
})

const oneloginTokenParser = createOneloginTokenParser()

module.exports = (memberModel, tokenParser = oneloginTokenParser) => async (lambdaEvent) => {
  const token = getAuthorizationToken(lambdaEvent.headers)
  const profile = await tokenParser(token)

  if (!profile) {
    return { role: ANONYMOUS_ROLE, id: '' }
  }

  const memberNumber = profile.title
  info('Member Number:', memberNumber)

  const member = await memberModel.find(memberNumber)

  if (!member) {
    info('Loading member from JWT profile:', profile)
    const profileMember = buildMemberFromProfile(profile)
    return { role: NON_MEMBER_ROLE, ...profileMember }
  }

  return { role: MEMBER_ROLE, ...member }
}
