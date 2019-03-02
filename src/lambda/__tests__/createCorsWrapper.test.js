const createCorsWrapper = require('../createCorsWrapper')

const wrapWithCorsHeaders = (origin, response) => {
  const responseWithCorsHeaders = createCorsWrapper({ origin })
  return responseWithCorsHeaders(response)
}

test('adds CORS headers in the response object for approved domain', () => {
  const response = wrapWithCorsHeaders('https://labs.sandboxpga.org', { statusCode: '200' })

  expect(response).toEqual({
    statusCode: '200',
    headers: {
      'Access-Control-Allow-Origin': 'https://labs.sandboxpga.org',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-api-key'
    }
  })
})

test('add origin headers to all pga domains', () => {
  const pgaDomains = [
    'https://account.pga.org',
    'https://jobs.sandboxpga.org',
    'https://admin.pga.local:4000',
    'https://labs.sandboxpga.org:3001'
  ]

  pgaDomains.forEach((domain) => {
    const response = wrapWithCorsHeaders(domain, {})
    expect(response.headers['Access-Control-Allow-Origin']).toEqual(domain)
  })
})

test('does not add CORS headers in the response object for unknown origin', () => {
  const input = { statusCode: '200', headers: {} }
  const response = wrapWithCorsHeaders('https://blah.com', input)

  expect(response).toEqual(input)
})
