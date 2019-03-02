const { path } = require('ramda')

const parseSocial = social => social.reduce((acc, { social_type: socialType, social_value: socialValue }) => ({
  ...acc,
  [socialType]: socialValue
}), {})

const parseViewingPermissions = ({
  view_email_public: viewEmailPublic,
  view_email_member: viewEmailMember,
  view_phone_public: viewPhonePublic,
  view_phone_member: viewPhoneMember,
  view_mobile_public: viewMobilePublic,
  view_mobile_member: viewMobileMember,
  view_address_public: viewAddressPublic,
  view_address_member: viewAddressMember,
  view_awards_public: viewAwardsPublic,
  view_awards_member: viewAwardsMember,
  view_certifications_public: viewCertificationsPublic,
  view_certifications_member: viewCertificationsMember,
  view_affiliations_public: viewAffiliationsPublic,
  view_affiliations_member: viewAffiliationsMember,
  view_expertises_public: viewExpertisePublic,
  view_expertises_member: viewExpertiseMember,
  view_profile_public: viewProfilePublic,
  view_profile_member: viewProfileMember
}) => ({
  viewEmailPublic,
  viewEmailMember,
  viewPhonePublic,
  viewPhoneMember,
  viewMobilePublic,
  viewMobileMember,
  viewAddressPublic,
  viewAddressMember,
  viewAwardsPublic,
  viewAwardsMember,
  viewCertificationsPublic,
  viewCertificationsMember,
  viewAffiliationsPublic,
  viewAffiliationsMember,
  viewExpertisePublic,
  viewExpertiseMember,
  viewProfilePublic,
  viewProfileMember
})

const parseMemberFields = ({
  first_name: firstName,
  last_name: lastName,
  member_class, // eslint-disable-line
  member_type: type,
  informal_name: informalName,
  profile_name: displayName,
  photo_profile: photo,
  certified_professional: certified,
  master_professional: masterProfessional,
  greenhouse_id: greenhouseId,
  universal_id: universalId,
  suspended,
  birthdate,
  gender,
  member_class_description: memberClassDescription,
  contact,
  viewing_permissions: viewingPermissions,
  expertises,
  social,
  certifications,
  awards,
  affiliations,
  overview
}, id) => ({
  id,
  firstName,
  lastName,
  class: member_class,
  type,
  informalName,
  displayName,
  photo,
  certified,
  masterProfessional,
  greenhouseId,
  universalId,
  suspended,
  birthdate,
  gender,
  phoneNumber: path(['0', 'phone'], contact),
  publicPhone: path(['0', 'phone'], contact),
  publicMobile: path(['0', 'mobile'], contact),
  memberClassDescription,
  publicEmail: path(['0', 'email'], contact),
  viewingPermissions: parseViewingPermissions(viewingPermissions[0]),
  expertise: expertises,
  social: parseSocial(social),
  certifications,
  awards,
  affiliations,
  overview
})

module.exports = {
  parseMemberFields
}
