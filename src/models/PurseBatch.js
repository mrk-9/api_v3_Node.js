const crypto = require('crypto')

const IV_LENGTH = 16
const generateIvFromName = (name, padding = 'PGA') => {
  return (name)
    .padEnd(IV_LENGTH, padding)
    .substring(0, IV_LENGTH)
}

const ALGORITHM = 'aes-128-cbc'
const ENCODING = 'binary'
const FORMAT = 'hex'
const encrypt = (data, key, iv) => {
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(data, 'utf8', ENCODING)
  encrypted += cipher.final(ENCODING)

  return Buffer
    .from(encrypted, ENCODING)
    .toString(FORMAT)
}

const encryptEventPlayer = (encryptionKey, eventPlayer) => {
  const name = eventPlayer.firstName + eventPlayer.lastName
  const iv = generateIvFromName(name)

  const encryptedTaxId = encrypt(eventPlayer.taxId, encryptionKey, iv)
  return { ...eventPlayer, taxId: encryptedTaxId }
}

module.exports = class PurseBatch {
  constructor (connector, table, encryptionKey) {
    this.connector = connector
    this.table = table
    this.encryptionKey = encryptionKey
  }

  create (attributes) {
    return this.connector.create(this.table, attributes)
  }

  checkEventPlayer (attributes) {
    return encryptEventPlayer(this.encryptionKey, attributes)
  }
}
