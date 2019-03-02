const Sections = require('./Sections.json')
const { ADMIN_ROLE } = require('../../src/schemas/AccessControlList')
const { Member } = require('../../src/factory/Member')

const members = Sections.map(s => Member({
  id: `5388${s.id}`,
  sectionId: s.id
}))

const LOCAL_ADMIN_MEMBER_NUMBER = '03615121'
const adminMember = Member({
  role: ADMIN_ROLE,
  id: LOCAL_ADMIN_MEMBER_NUMBER,
  sectionId: Sections[0].id
})

module.exports = [adminMember, ...members]
