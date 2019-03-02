exports.ensureProfileOwner = (rootValue, { id }, { user }) => {
  if (id === user.id) {
    return true
  }

  throw new Error(`You are not authorized to update member '${id}'`)
}

exports.authorizeWithSectionScope = (obj, args, context) =>
  ({ scope: { sectionId: context.user.sectionId } })

const withViewingPermissions = view => ({ viewingPermissions }, args, context) => {
  return viewingPermissions ? !!viewingPermissions[view] : false
}
exports.withViewingPermissions = withViewingPermissions
exports.canSeeMemberId = ({ id }, args, { user }) => {
  return id === user.id
}

const canSeePrivateInfo = (member, args, { user }) => {
  if (member.id === user.id) {
    return true
  }
  return member.class !== 'A3'
}
exports.canSeePrivateInfo = canSeePrivateInfo

exports.withPermissionsAndPrivacy = view => (member, args, context) => {
  return withViewingPermissions(view)(member, args, context) &&
    canSeePrivateInfo(member, args, context)
}

exports.ensureEmailOwner = (member, { input }, { user }) => {
  if (input.primaryEmail === user.primaryEmail) {
    return true
  }
  return false
}

exports.ensureGreenhouseIdOwner = async (member, { greenhouseId }, context) => {
  const ghUser = await context.Job.findUserByEmail(context.user.primaryEmail)
  if (ghUser.id === parseInt(greenhouseId)) {
    return true
  }
  return false
}
