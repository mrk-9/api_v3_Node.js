const { path } = require('ramda')

const mapHiringManager = (manager = {}) => ({
  id: manager.id,
  firstName: manager.first_name,
  lastName: manager.last_name,
  name: manager.name,
  employeeId: manager.employee_id
})

const mapJobOpening = (opening = {}) => ({
  id: opening.id,
  status: opening.status,
  openedAt: opening.opened_at
})

const mapCustomFieldOption = option => ({
  id: option.id,
  name: option.name,
  priority: option.priority
})

exports.mapJob = job => ({
  id: job.id,
  jobTitle: job.name,
  status: job.status,
  userId: job.user_id,
  offices: job.offices,
  hiringManager: mapHiringManager(job.hiring_team.hiring_managers[0]),
  applicantGroup: job.custom_fields.applicant_group,
  jobCategory: job.custom_fields.job_categories,
  employmentType: job.custom_fields.employment_type,
  yearsExperience: job.custom_fields.years_experience,
  submissionDeadline: job.custom_fields.submission_deadline,
  baseCompensation: job.custom_fields.base_compensation
    ? job.custom_fields.base_compensation.value
    : null,
  baseCompensationMax: job.custom_fields.base_compensation_max
    ? job.custom_fields.base_compensation_max.value
    : null,
  paySchedule: job.custom_fields.pay_schedule,
  additionalIncome: job.custom_fields.additional_income,
  totalCompensation: job.custom_fields.total_anticipated_compensation
    ? job.custom_fields.total_anticipated_compensation.value
    : null,
  contact: {
    name: job.custom_fields.contact_name,
    title: job.custom_fields.contact_title,
    email: job.custom_fields.contact_email
  },
  education: job.custom_fields.education,
  applyVia: job.custom_fields.apply_via,
  website: job.custom_fields.external_job_url,
  overview: job.custom_fields.overview,
  experienceRequired: job.custom_fields.experience_required,
  responsibilities: job.custom_fields.essential_responsibilities,
  benefits: job.custom_fields.benefits,
  termOfServiceAgreement: job.custom_fields.term_of_service_agreement,
  currentStep: job.custom_fields.current_step,
  createdAt: job.created_at,
  openedAt: job.opened_at,
  openings: job.openings.map(mapJobOpening)
})

exports.mapJobCustomField = fields => ({
  id: fields.id,
  name: fields.name,
  active: fields.active,
  fieldType: fields.field_type,
  priority: fields.priority,
  valueType: fields.value_type,
  private: fields.private,
  required: fields.required,
  requireApproval: fields.require_approval,
  triggerNewVersion: fields.trigger_new_version,
  nameKey: fields.name_key,
  customFieldOptions: fields.custom_field_options.map(mapCustomFieldOption)
})

exports.mapJobPermissions = fields => ({
  id: fields.id,
  officeId: fields.office_id,
  departmentId: fields.department_id,
  userRoleId: fields.user_role_id
})

exports.mapJobApplication = fields => ({
  id: fields.id,
  firstName: fields.first_name,
  lastName: fields.last_name,
  createdAt: fields.created_at,
  updatedAt: fields.updated_at,
  attachments: fields.attachments.map(item => ({
    filename: item.filename,
    type: item.type,
    url: item.url
  })),
  applicationId: path(['0', 'application_ids'], fields)
})
