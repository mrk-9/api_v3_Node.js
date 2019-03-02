const getParams = ({ userGroup, limit }) => ({
  page: 0,
  hitsPerPage: limit,
  facetFilters: [`groups:${userGroup}`]
})

const GROUPS = {
  MB: 'Member',
  ST: 'Student',
  AP: 'Apprentice',
  SF: 'Staff',
  IP: 'Industry Partner'
}

const camelCase = (i) => ({
  title: i.title,
  message: i.message,
  label: i.label,
  link: i.link,
  groups: i.groups,
  sections: i.sections,
  slug: i.slug,
  date: i.date,
  updatedDate: i.updated_date
})

const getUserGroup = (group) => GROUPS[group] || ''

const RESOURCE_ANNOUNCEMENTS_INDEX = 'resources_announcements'

const Announcement = (algolia) => {
  return {
    async findBy ({ group, limit, query = '' }) {
      const userGroup = getUserGroup(group)
      const params = getParams({ userGroup, limit })

      const { hits } = await algolia.findBy(RESOURCE_ANNOUNCEMENTS_INDEX, { params, query })

      return hits.map(camelCase)
    }
  }
}

module.exports = Announcement
