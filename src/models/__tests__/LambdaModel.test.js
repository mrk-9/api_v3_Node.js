const LambdaModel = require('../LambdaModel')

describe('LambdaModel', () => {
  test('success', () => {
    const lambdaMock = {
      invoke: ({ FunctionName, Payload }) => {
        return {
          promise: jest.fn().mockResolvedValue({
            StatusCode: 202,
            Payload: `${FunctionName}:${Payload}`
          })
        }
      }
    }

    const model = LambdaModel(lambdaMock)
    return expect(model.run('fn', { a: 1 }))
      .resolves
      .toEqual({ status: 202, message: 'fn:{"a":1}' })
  })

  test('error', () => {
    const lambdaMock = {
      invoke: ({ FunctionName, Payload }) => {
        return {
          promise: jest.fn().mockRejectedValue({ statusCode: 404, message: 'boom' })
        }
      }
    }

    const model = LambdaModel(lambdaMock)
    return expect(model.run('fn', { a: 1 }))
      .resolves
      .toEqual({ status: 404, message: 'Error: boom' })
  })
})
