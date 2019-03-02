const Announcement = require('../Announcement')

const mockConnector = {
  findBy ({ query, params }) {
    return Promise.resolve({
      hits: [{
        title: 'first announcement',
        message: 'messaging system',
        label: 'that labels',
        link: 'https://wwww.link.com',
        groups: ['member', 'staff', 'student'],
        sections: ['Central New York Section', 'Colorado Section', 'Connecticut Section'],
        slug: 'first-announcement',
        date: '2017-11-21T05:00:00.000Z',
        updated_date: '2017-12-01T14:31:59.000Z'
      }]
    })
  }
}

describe('Announcement Model', () => {
  test('it can get search results', async () => {
    const announcement = Announcement(mockConnector)
    const params = {
      page: 0,
      hitsPerPage: 1,
      facetFilters: ['groups:member']
    }
    const query = ''
    const hits = await announcement.findBy({ query, params })
    const EXPECTED = [{
      title: 'first announcement',
      message: 'messaging system',
      label: 'that labels',
      link: 'https://wwww.link.com',
      groups: ['member', 'staff', 'student'],
      sections: ['Central New York Section', 'Colorado Section', 'Connecticut Section'],
      slug: 'first-announcement',
      date: '2017-11-21T05:00:00.000Z',
      updatedDate: '2017-12-01T14:31:59.000Z'
    }]
    expect(hits).toEqual(EXPECTED)
  })
})
