const PREFLIGHT_MAX_CACHE_SECONDS = (24 * 60 * 60).toString()

const PRODUCTION_SUBDOMAIN_RE = /^https:\/\/.+\.pga.org$/
const SANDBOX_AND_LOCAL_SUBDOMAIN_RE = /^https:\/\/[^.]+\.sandboxpga.org(:\d{4})?$/
const LOCAL_SUBDOMAIN_RE = /^https:\/\/[^.]+\.pga.local:\d{4}$/

const CORS_ORIGIN_ALLOW_LIST = [
  PRODUCTION_SUBDOMAIN_RE,
  SANDBOX_AND_LOCAL_SUBDOMAIN_RE,
  LOCAL_SUBDOMAIN_RE
]

const isOriginAllowed = (origin) => {
  return CORS_ORIGIN_ALLOW_LIST.some(re => re.test(origin))
}

module.exports = (headers) => (response) => {
  const newResponse = { headers: {}, ...response }
  const origin = headers.origin || headers.Origin

  if (isOriginAllowed(origin)) {
    newResponse.headers['Access-Control-Allow-Origin'] = origin
    newResponse.headers['Access-Control-Allow-Methods'] = 'POST'
    newResponse.headers['Access-Control-Max-Age'] = PREFLIGHT_MAX_CACHE_SECONDS
    newResponse.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,x-api-key'
  }

  return newResponse
}
