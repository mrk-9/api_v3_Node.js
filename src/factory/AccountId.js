const casual = require('casual')

module.exports = () => {
  const companyId = casual.integer(1000, 9999).toString()
  const departmentId = casual.integer(10000, 19000).toString()
  const projectId = casual.integer(90000, 100000).toString()
  const naturalAccountId = casual.integer(101100, 102100).toString()

  return `${companyId}-${departmentId}-${projectId}-${naturalAccountId}-0`
}
