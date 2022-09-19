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

const execa = require('execa')
const inquirer = require('inquirer')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-helper', { provider: 'debug' })

/**
 * Sort array values according to the sort order and/or sort-field.
 *
 * Note that this will use the Javascript sort() function, thus the values will
 * be sorted in-place.
 *
 * @param {Array<object>} values array of objects (with fields to sort by)
 * @param {object} [options] sort options to pass
 * @param {boolean} [options.descending] true by default, sort order
 * @param {string} [options.field] 'date' by default, sort field ('name', 'date' options)
 * @returns {Array<object>} the sorted values array (input values array sorted in place)
 */
function sortValues (values, { descending = true, field = 'date' } = {}) {
  const supportedFields = ['name', 'date']
  if (!supportedFields.includes(field)) { // unknown field, we just return the array
    return values
  }

  values.sort((left, right) => {
    const d1 = left[field]
    const d2 = right[field]

    if (descending) {
      return (d1 > d2) ? -1 : (d1 < d2) ? 1 : 0
    } else {
      return (d1 > d2) ? 1 : (d1 < d2) ? -1 : 0
    }
  })
  return values
}

/** @private */
async function runScript (command, dir, cmdArgs = []) {
  if (!command) {
    return null
  }
  if (!dir) {
    dir = process.cwd()
  }

  if (cmdArgs.length) {
    command = `${command} ${cmdArgs.join(' ')}`
  }

  // we have to disable IPC for Windows (see link in debug line below)
  const isWindows = process.platform === 'win32'
  /* istanbul ignore next */
  const ipc = isWindows ? null : 'ipc'

  const child = execa.command(command, {
    stdio: ['inherit', 'inherit', 'inherit', ipc],
    shell: true,
    cwd: dir,
    preferLocal: true
  })

  /* istanbul ignore else */
  if (isWindows) {
    aioLogger.debug(`os is Windows, so we can't use ipc when running ${command}`)
    aioLogger.debug('see: https://github.com/adobe/aio-cli-plugin-app/issues/372')
  } else {
    // handle IPC from possible aio-run-detached script
    child.on('message', message => {
      if (message.type === 'long-running-process') {
        const { pid, logs } = message.data
        aioLogger.debug(`Found ${command} event hook long running process (pid: ${pid}). Registering for SIGTERM`)
        aioLogger.debug(`Log locations for ${command} event hook long-running process (stdout: ${logs.stdout} stderr: ${logs.stderr})`)
        process.on('exit', () => {
          try {
            aioLogger.debug(`Killing ${command} event hook long-running process (pid: ${pid})`)
            process.kill(pid, 'SIGTERM')
          } catch (_) {
          // do nothing if pid not found
          }
        })
      }
    })
  }

  return child
}

/**
 * Prompt for confirmation.
 *
 * @param {string} [message=Confirm?] the message to show
 * @param {boolean} [defaultValue=false] the default value if the user presses 'Enter'
 * @returns {boolean} true or false chosen for the confirmation
 */
async function prompt (message = 'Confirm?', defaultValue = false) {
  return inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message,
    default: defaultValue
  }).then(function (answers) {
    return answers.confirm
  })
}

module.exports = {
  sortValues,
  runScript,
  prompt
}
