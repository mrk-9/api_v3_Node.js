const { ADMIN_ROLE } = require('../AccessControlList')
const { testSchemaQuery } = require('../SchemaTester')

const sections = [
  'Alabama-NW Florida Section',
  'Aloha Section',
  'Carolinas Section',
  'Central New York Section',
  'Colorado Section',
  'Connecticut Section',
  'Gateway Section',
  'Georgia Section',
  'Gulf States Section',
  'Illinois Section',
  'Indiana Section',
  'Iowa Section',
  'Kentucky Section',
  'Metropolitan Section',
  'Michigan Section',
  'Middle Atlantic Section',
  'Midwest Section',
  'Minnesota Section',
  'NE New York Section',
  'Nebraska Section',
  'New England Section',
  'New Jersey Section',
  'North Florida Section',
  'Northern California Section',
  'Northern Ohio Section',
  'Northern Texas Section',
  'Pacific Northwest Section',
  'Philadelphia Section',
  'Rocky Mountain Section',
  'South Central Section',
  'South Florida Section',
  'Southern California Section',
  'Southern Ohio Section',
  'Southern Texas Section',
  'Southwest Section',
  'Sun Country Section',
  'Tennessee Section',
  'Tri-State Section',
  'Utah Section',
  'Western New York Section',
  'Wisconsin Section'
]

const EXPECTED = [{
  title: 'MSR STATUS UPDATE',
  message: 'MSR Cycle Evaluation processes will be continue to be performed through June 30, 2018. The MSR requirement values currently displayed may have daily updates based on additional processes to be completed by June 30, 2018.',
  label: null,
  link: null,
  groups: ['Member', 'Staff'],
  sections: sections,
  slug: 'msr-status-update',
  updatedDate: '2018-06-19T15:36:54.000Z',
  date: '2018-06-15T00:00:00.000Z'
}]

const contextWithMethodMock = (methodName, returnValue = EXPECTED) => ({
  user: { role: ADMIN_ROLE },
  Announcement: { [methodName]: () => Promise.resolve(returnValue) }
})

test('list announcements', () => {
  return testSchemaQuery('announcements', {
    context: contextWithMethodMock('findBy'),
    variables: {
      limit: 1,
      group: 'MB'
    },
    expected: EXPECTED
  })
})
