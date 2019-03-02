const { warn } = require('@pga/logger')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')

const KEY_CACHE = require('./oneloginKeys.json')

const fetchPublicKeyCert = async (fetchFn, certsUrl, keyId) => {
  const { data } = await fetchFn(certsUrl, { responseType: 'json' })
  const targetKey = data.keys.find(({ kid }) => kid === keyId)

  if (!targetKey) {
    throw new Error(`Invalid token Key ID: '${keyId}'`)
  }

  return jwkToPem(targetKey)
}

const getTokenKeyDetails = (token) => {
  const decodedToken = jwt.decode(token, { complete: true })

  if (!decodedToken) {
    throw new Error('Unable to decode JWT token')
  }

  return {
    keyId: decodedToken.header.kid,
    certsUrl: `${decodedToken.payload.iss}/certs`
  }
}

module.exports = (fetchFn = axios, keyCache = KEY_CACHE) => async (token) => {
  if (!token) {
    return null
  }

  const { certsUrl, keyId } = getTokenKeyDetails(token)

  if (!keyCache[keyId]) {
    warn('Key Cache Miss:', keyId)
    keyCache[keyId] = await fetchPublicKeyCert(fetchFn, certsUrl, keyId)
  }

  const publicKey = keyCache[keyId]

  return jwt.verify(token, publicKey, {
    algorithms: 'RS256',
    issuer: 'https://openid-connect.onelogin.com/oidc'
  })
}
