const { loadConnectors } = require('../connectors')
const { ApiModel } = require('./ApiModel')
const Announcement = require('./Announcement')
const FileManagerModel = require('./FileManagerModel')
const LambdaModel = require('./LambdaModel')
const JobModel = require('./JobModel')
const JobApplicationModel = require('./JobApplicationModel')
const PurseBatch = require('./PurseBatch')
const ResourceCrud = require('./ResourceCrud')
const FacilityModel = require('./Facility')

exports.loadModels = (config) => {
  const { algolia, dynamoDb, harvest, lambda, pgaV2, s3 } = loadConnectors(config)

  const models = {
    Announcement: Announcement(algolia),
    BillingEvent: new ResourceCrud(dynamoDb, 'BillingEvent'),
    Event: new ResourceCrud(dynamoDb, 'Event'),
    Facility: new ResourceCrud(dynamoDb, 'Facility'),
    NewFacility: FacilityModel(algolia),
    Invoice: new ResourceCrud(dynamoDb, 'Invoice'),
    Lambda: LambdaModel(lambda),
    Job: JobModel({ algolia, harvest }),
    JobApplication: JobApplicationModel(harvest, config.ATTACHMENTS_BUCKET_NAME),
    JobAttachment: FileManagerModel(s3, config.ATTACHMENTS_BUCKET_NAME),
    ProfileImage: FileManagerModel(s3, config.PGA_ORG_FILE_BUCKET),
    Journal: new ResourceCrud(dynamoDb, 'Journal'),
    Member: new ResourceCrud(dynamoDb, 'Member'),
    PaymentType: new ResourceCrud(dynamoDb, 'PaymentType'),
    Partner: new ResourceCrud(dynamoDb, 'Partner'),
    Pga: ApiModel(pgaV2),
    Product: new ResourceCrud(dynamoDb, 'Product'),
    PurseBatch: new PurseBatch(dynamoDb, 'PurseBatch', config.SSN_ENCRYPTION_KEY),
    Section: new ResourceCrud(dynamoDb, 'Section')
  }

  return models
}
