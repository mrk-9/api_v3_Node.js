const casual = require('casual')
const address = require('./Address')
const education = require('./Education')

casual.define('gender', () => casual.random_element(['M', 'F']))
casual.define('memberType', () => casual.random_element(['MB', 'AP', 'ST', 'PE', 'PQ', 'QE', 'TA']))
casual.define('memberClass', () => casual.random_element(['A1', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15',
  'A16', 'A17', 'A18', 'A19', 'A2', 'A20', 'A21', 'A22', 'A23', 'A24', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
  'A9', 'B1', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B2', 'B20', 'B21', 'B22',
  'B23', 'B4', 'B6', 'B7', 'B8', 'B9', 'F', 'HM', 'IN', 'LM', 'LMA', 'LMC', 'LMM', 'LMM', 'MP', 'RM'
]))

const Member = (fields) => {
  const primaryFacilityId = casual.integer(1, 1000000).toString()
  const firstName = casual.first_name
  const lastName = casual.last_name
  const sectionId = casual.integer(1, 1000000).toString()
  const email = `${firstName}_${lastName}@example.com`
  const primaryFacilityUid = casual.integer(1, 1000000).toString()

  return {
    id: casual.integer(1, 1000000).toString(),
    class: casual.memberClass,
    type: casual.memberType,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}, PGA`,
    sectionId,
    greenhouseId: 597529,
    universalId: casual.integer(1, 1000000).toString(),
    birthdate: casual.date(),
    phoneNumber: casual.integer(12223334444, 17778889999).toString(),
    publicPhone: casual.integer(12223334444, 17778889999).toString(),
    publicMobile: casual.integer(12223334444, 17778889999).toString(),
    primaryMobile: casual.integer(12223334444, 17778889999).toString(),
    suspended: casual.boolean,
    gender: casual.gender,
    masterProfessional: casual.boolean,
    publicEmail: email,
    primaryEmail: email,
    primaryFacilityId,
    facilityIds: [primaryFacilityId],
    primaryFacilityUid,
    facilityUids: [primaryFacilityUid],
    memberClassDescription: 'Assistant Professional',
    address: address(),
    education: education(),
    overview: casual.sentences(3),
    viewingPermissions: {
      viewCertificationsMember: casual.boolean,
      viewCertificationsPublic: casual.boolean,
      viewPhonePublic: casual.boolean,
      viewPhoneMember: casual.boolean,
      viewAddressPublic: casual.boolean,
      viewAddressMember: casual.boolean,
      viewExpertisePublic: casual.boolean,
      viewExpertiseMember: casual.boolean,
      viewEmailPublic: casual.boolean,
      viewEmailMember: casual.boolean,
      viewMobilePublic: casual.boolean,
      viewMobileMember: casual.boolean,
      viewAffiliationsPublic: casual.boolean,
      viewAffiliationsMember: casual.boolean,
      viewAwardsPublic: casual.boolean,
      viewAwardsMember: casual.boolean
    },
    expertise: [{
      id: casual.integer(100, 500).toString(),
      name: 'general management'
    }],
    social: {
      facebook: casual.url,
      linkedin: casual.url,
      twitter: casual.url,
      youtube: casual.url,
      instagram: casual.url,
      website: casual.url
    },
    personalAffiliations: [{
      description: 'Master Professional - Player Development',
      effectiveYear: null
    }],
    personalAwards: [{
      description: 'Section Teacher of the Year',
      effectiveYear: null
    }],
    personalCertifications: [{
      description: 'Master Professional - Player Development',
      effectiveYear: null
    }],
    officialCertifications: [{
      description: 'Master Professional - Player Development',
      effectiveYear: 2018
    }],
    officialAwards: [{
      description: 'Section Teacher of the Year',
      effectiveYear: 2008
    }],
    certifications: [{
      description: 'Master Professional - Player Development',
      effectiveYear: 2018
    }],
    awards: [{
      description: 'Section Teacher of the Year',
      effectiveYear: 2008
    }],
    ...fields
  }
}

module.exports = {
  Member
}
