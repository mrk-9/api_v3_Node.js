const { identity } = require('ramda')
const moment = require('moment')
// custom field options
const APPLY_VIA_FACILITY_WEBSITE = 11612190
const MAX_NO_OF_RND_IMAGES = 12

// image id is an int randomly selected from range 0-11
const getImageIdField = () => ({
  name_key: 'image_set_id',
  value: Math.floor(Math.random() * Math.floor(MAX_NO_OF_RND_IMAGES))
})

const getCustomOptionalField = (name, obj, field, fn = identity) =>
  obj[field] ? { name_key: name, value: fn(obj[field]) } : undefined

const getCustomOptionalFieldCurrency = (name, obj, field, fn = identity) =>
  obj[field] ? { name_key: name, unit: 'USD', value: fn(obj[field]) } : undefined

const getCustomOptionalWebsite = (name, obj, website, applyVia) =>
  obj['applyVia'] && obj['website']
    ? { name_key: name, value: parseInt(obj['applyVia']) === APPLY_VIA_FACILITY_WEBSITE && obj['website'] }
    : undefined

const mapCustomFields = jobDetails =>
  [
    getCustomOptionalField('applicant_group', jobDetails, 'applicantGroup', parseInt),
    getCustomOptionalField('years_experience', jobDetails, 'yearsExperience', parseInt),
    getCustomOptionalField('employment_type', jobDetails, 'employmentType', parseInt),
    getCustomOptionalField('contact_title', jobDetails, 'contactTitle'),
    getCustomOptionalField('contact_email', jobDetails, 'contactEmail'),
    getCustomOptionalField('contact_name', jobDetails, 'contactName'),
    getCustomOptionalField('job_categories_1', jobDetails, 'jobCategory', parseInt),
    getCustomOptionalField('current_step', jobDetails, 'currentStep'),
    getCustomOptionalField('submission_deadline', jobDetails, 'submissionDeadline', val => moment(val).format('L')),
    getCustomOptionalField('pay_schedule', jobDetails, 'paySchedule', parseInt),
    getCustomOptionalField('apply_via', jobDetails, 'applyVia', parseInt),
    getCustomOptionalWebsite('external_job_url', jobDetails, 'website', 'applyVia'),
    getCustomOptionalField('additional_income', jobDetails, 'additionalIncome'),
    getCustomOptionalFieldCurrency('base_compensation_1', jobDetails, 'baseCompensation', Number),
    getCustomOptionalFieldCurrency('base_compensation_max', jobDetails, 'baseCompensationMax', Number),
    getCustomOptionalFieldCurrency('total_anticipated_compensation_1', jobDetails, 'totalCompensation', Number),
    getCustomOptionalField('education_required', jobDetails, 'education', parseInt),
    getImageIdField(),
    getCustomOptionalField('overview', jobDetails, 'overview'),
    getCustomOptionalField('experience_required', jobDetails, 'experienceRequired'),
    getCustomOptionalField('essential_responsibilities', jobDetails, 'responsibilities'),
    getCustomOptionalField('benefits', jobDetails, 'benefits'),
    getCustomOptionalField(
      'term_of_service_agreement',
      jobDetails,
      'termOfServiceAgreement',
      val => (val ? 'yes' : 'no')
    )
  ].filter(item => item !== undefined)

module.exports = mapCustomFields
