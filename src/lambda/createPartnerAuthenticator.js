const { info } = require('@pga/logger')
const { path } = require('ramda')

module.exports = (partnerModel) => async (lambdaEvent) => {
  const partnerUserArn = path(['requestContext', 'identity', 'userArn'], lambdaEvent)

  if (!partnerUserArn) {
    throw new Error('Could not find user ARN in request!')
  }

  info('Partner User ARN:', partnerUserArn)
  const partner = await partnerModel.find(partnerUserArn)

  if (partner == null) {
    throw new Error(`No partner associated with user ARN: '${partnerUserArn}'`)
  }

  return partner
}
