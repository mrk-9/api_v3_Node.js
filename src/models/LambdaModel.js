module.exports = (lambda) => ({
  async run (functionName, args) {
    const invokeParams = {
      InvocationType: 'Event',
      FunctionName: functionName,
      Payload: JSON.stringify(args)
    }

    try {
      const response = await lambda.invoke(invokeParams).promise()
      return {
        message: response.Payload,
        status: response.StatusCode
      }
    } catch (err) {
      return {
        message: `Error: ${err.message}`,
        status: err.statusCode // error has statusCode not StatusCode
      }
    }
  }
})
