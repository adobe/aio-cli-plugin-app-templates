/*
 * Copyright 2022 Adobe Inc. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const { getToken, invalidateToken, context } = require('@adobe/aio-lib-ims')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-login', { provider: 'debug' })

async function retrieveAccessToken() {
    const current = await context.getCurrent()
    aioLogger.debug(`current context: ${current}`)
    try {
      let ctx = current || CLI
      aioLogger.debug(`context set to ${ctx}`)
      try {
        await invalidateToken(ctx, true)
      } catch(err) {
        aioLogger.debug(`failure to invalidate token: ${err}`)
      }
      aioLogger.debug(`context: ${ctx}`)
      let token = await getToken(ctx, { open: true })
      return token
    } catch(err) {
      throw new Error(`Cannot get token for context ${ctx}: ${err.message}` || err)
    }
}

module.exports = {
  retrieveAccessToken
}
