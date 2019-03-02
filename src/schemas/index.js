const fs = require('fs')
const { makeExecutableSchema } = require('graphql-tools')
const path = require('path')
const { concat, mergeDeepRight } = require('ramda')

const { acl } = require('./AccessControlList')

const listFilesRecursive = (folder) => {
  const processFile = (file) => {
    const filePath = path.join(folder, file)
    const isFolder = fs.statSync(filePath).isDirectory()

    return isFolder ? listFilesRecursive(filePath) : [filePath]
  }

  return fs.readdirSync(folder)
    .map(processFile)
    .reduce(concat, [])
}

const loadTypeDefs = (schemaFiles) =>
  schemaFiles
    .filter(filePath => filePath.endsWith('.graphql'))
    .map(filePath => fs.readFileSync(filePath, 'utf8'))

const loadResolvers = (schemaFiles) =>
  schemaFiles
    .filter(filePath => filePath.endsWith('Resolvers.js'))
    .map(require)
    .reduce(mergeDeepRight)

const schemaFiles = listFilesRecursive(__dirname)
const typeDefs = loadTypeDefs(schemaFiles)
const resolvers = loadResolvers(schemaFiles)

const securedResolvers = acl.secure(resolvers)

module.exports = makeExecutableSchema({ typeDefs, resolvers: securedResolvers })
