const { getTokenData, getToken, invalidateToken, context } = require('@adobe/aio-lib-ims')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-login', { provider: 'debug' })

async function retrieveAccessToken() {
    const current = await context.getCurrent()
    try {
      let ctx = current || CLI
      try {
        await invalidateToken(ctx, true)
      } catch(err) {
        aioLogger.debug(`failure to invalidate token: ${err}`)
      }
      aioLogger.debug(`context: ${ctx}`)
      if (ctx === CLI) {
          await context.setCli({
            'cli.bare-output': false
          })
      }
      let token = await getToken(ctx, { open: true })
      aioLogger.debug(`Getting access token: ${token}`)
      return getTokenData(token)
    } catch(err) {
      throw new Error(`Cannot get token for context ${ctx}: ${err.message}` || err)
    }
}

module.exports = {
  retrieveAccessToken
}