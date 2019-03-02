const { graphiqlLambda } = require('apollo-server-lambda')

exports.handler = graphiqlLambda({ endpointURL: 'graphql' })
