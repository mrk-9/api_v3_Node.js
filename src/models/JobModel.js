const moment = require('moment')
const { path } = require('ramda')

const mapCustomFields = require('./mapToHarvestApi')

const {
  mapJob,
  mapJobCustomField,
  mapJobPermissions
} = require('./mapFromHarvestApi')

const TEMPLATE_JOB_ID = 601233
const DEFAULT_NUMBER_OPENINGS = 1

const createJob = ({ connector, jobDetails }) =>
  connector.postJob({
    job: {
      template_job_id: TEMPLATE_JOB_ID,
      number_of_openings: DEFAULT_NUMBER_OPENINGS,
      job_post_name: jobDetails.jobTitle,
      job_name: jobDetails.jobTitle,
      office_ids: [parseInt(jobDetails.office)],
      requisition_id: jobDetails.applicantGroup
    }
  })

const addHiringTeam = ({ connector, jobId, userId }) =>
  connector.putHiringTeam({
    jobId,
    team: {
      hiring_managers: [{ user_id: parseInt(userId) }]
    }
  })

const updateJob = ({ connector, jobId, jobDetails }) =>
  connector.patchJob({
    job: {
      id: jobId,
      name: jobDetails.jobTitle,
      office_ids: [parseInt(jobDetails.office)],
      custom_fields: mapCustomFields(jobDetails)
    }
  })

const parseFacilities = (facilities = []) => {
  return facilities
    .filter(f => f.greenhouse_id)
    .map(f => ({
      id: f.greenhouse_id,
      name: f.facility_name,
      city: f.city,
      state: f.state,
      zip: f.zip
    }))
}

const parseJobFromAlgolia = (job) => {
  return ({
    id: job.jobId,
    offices: parseFacilities(job.facilities),
    applicantGroup: job.applicantGroup,
    jobCategory: job.job_category,
    jobTitle: job.jobTitle,
    status: job.status,
    employmentType: job.employment_type,
    yearsExperience: job.years_experience,
    submissionDeadline: moment.unix(job.submission_deadline).format('YYYY-MM-DD'),
    baseCompensation: path(['base_compensation', 'value'], job),
    baseCompensationMax: path(['base_compensation_max', 'value'], job),
    paySchedule: job.pay_schedule,
    additionalIncome: job.additional_income,
    totalCompensation: path(['total_compensation', 'value'], job),
    contact: {
      name: job.job_contact_name,
      title: job.job_contact_title,
      email: job.job_contact_email
    },
    education: job.education_required,
    applyVia: job.apply_via,
    overview: job.overview,
    experienceRequired: job.experience_required,
    responsibilities: job.responsibilities,
    benefits: job.benefits,
    termOfServiceAgreement: job.tos,
    currentStep: job.current_step,
    createdAt: moment.unix(job.created || job.opened).utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
    openedAt: moment.unix(job.opened).utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
    website: job.website,
    hiringManager: {
      employeeId: null,
      firstName: null,
      id: null,
      lastName: null
    }
  })
}

const JOBS_INDEX = 'live_jobs'

const JobModel = ({ algolia, harvest }) => ({
  create: async (jobDetails) => {
    const newJob = await createJob({ connector: harvest, jobDetails })

    const addTeamResult = await addHiringTeam({
      connector: harvest,
      jobId: newJob.id,
      userId: jobDetails.userId
    })

    if (!addTeamResult.success) {
      throw new Error(
        `Error adding User:${jobDetails.userId} to Hiring Team: ${JSON.stringify(addTeamResult)}`
      )
    }

    return updateJob({ connector: harvest, jobId: newJob.id, jobDetails })
  },

  find: async (jobId) => {
    const job = await harvest.findJob(jobId)
    return mapJob(job)
  },

  findUserByEmail (email) {
    return harvest.findUserByEmail(email)
  },

  getCustomFields: async () => {
    const customFields = await harvest.getJobCustomFields()
    return customFields.map(mapJobCustomField)
  },

  getJobPermissions: async (greenhouseId) => {
    const jobPermissions = await harvest.getJobPermissions(greenhouseId)
    return jobPermissions.map(mapJobPermissions)
  },

  createJobPermission: async (id, facilityId) => {
    const DEFAULT_USER_ROLE = 17735
    const newPermission = await harvest.putJobPermission(id,
      {
        user_role_id: DEFAULT_USER_ROLE,
        office_id: facilityId
      }
    )
    return {
      id: newPermission.id,
      officeId: newPermission.office_id,
      userRoleId: newPermission.user_role_id
    }
  },

  update: async (jobId, input) => {
    const job = await harvest.patchJob({
      job: {
        id: jobId,
        name: input.jobTitle,
        office_ids: [parseInt(input.office)],
        custom_fields: mapCustomFields(input)
      }
    })
    return mapJob(job)
  },

  duplicate: async (jobId, jobTitle) => {
    const job = await harvest.postJob({
      job: {
        template_job_id: jobId,
        number_of_openings: DEFAULT_NUMBER_OPENINGS,
        job_post_name: jobTitle,
        job_name: jobTitle
      }
    })
    return mapJob(job)
  },

  async getJobsPostedBy ({ greenhouseId }) {
    const userJobs = await harvest.getMyJobs(greenhouseId)
    const jobIds = userJobs.map(item => item.job_id.toString())

    const jobs = await algolia.findBatch(JOBS_INDEX, jobIds)

    return jobs
      .filter(job => job)
      .map(parseJobFromAlgolia)
  },

  createUser ({ firstName, lastName, primaryEmail }) {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: primaryEmail
    }
    return harvest.postUser(payload)
  }
})

module.exports = JobModel
