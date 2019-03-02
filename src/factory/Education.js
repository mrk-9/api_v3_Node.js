const casual = require('casual')

module.exports = () => ({
  currentLevel: casual.random_element(['U1', 'U2', 'U3']),
  companyName: casual.company_name,
  requirements: [
    {
      'requireId': 'A0QUALTST',
      'levelCd': 'A0',
      'reasonCd': 'COMP',
      'completeDate': '2018-06-26',
      'score': 77,
      'remarks': '164'
    }
  ],
  levels: [
    {
      'levelCd': 'A0',
      'completeCd': 'COMPLETE',
      'startDate': '2018-06-25',
      'endDate': '2018-06-26'
    }
  ],
  subscriptions: [
    {
      'productId': 'MO2',
      'description': 'Level 2 - Golf Operations',
      'startDate': '2019-01-07',
      'endDate': '2020-02-06'
    },
    {
      'productId': 'M1',
      'description': 'Level 1',
      'startDate': '2019-01-07',
      'endDate': '2020-01-07'
    },
    {
      'productId': 'M1',
      'description': 'Level 1',
      'startDate': '2019-01-07',
      'endDate': '2020-01-07'
    },
    {
      'productId': 'M1',
      'description': 'Level 1',
      'startDate': '2019-01-07',
      'endDate': '2020-01-07'
    },
    {
      'productId': 'M1',
      'description': 'Level 1',
      'startDate': '2019-01-07',
      'endDate': '2020-01-07'
    }
  ]
})
