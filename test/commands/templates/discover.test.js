/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TheCommand = require('../../../src/commands/templates/discover')
const BaseCommand = require('../../../src/BaseCommand')

const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson } = require('../../../src/lib/npm-helper')
const inquirer = require('inquirer')
const { stdout } = require('stdout-stderr')
const { getTemplates } = require('../../../src/lib/template-registry-helper')
const { SEARCH_CRITERIA_FILTER_NOT } = require('@adobe/aio-lib-templates')

jest.mock('inquirer')
jest.mock('../../../src/lib/template-registry-helper')
jest.mock('@adobe/aio-lib-ims', () => ({
  getToken: jest.fn(),
  context: {
    setCli: jest.fn()
  }
}))

jest.mock('@adobe/aio-cli-lib-app-config')
const { load: loadConfig } = require('@adobe/aio-cli-lib-app-config')
const mockAIOConfigJSON = JSON.parse('{"aio": {"project": {"id": "project-id","org": {"id": "org-id"}}}}')

jest.mock('@adobe/aio-lib-env')
const libEnv = require('@adobe/aio-lib-env')

jest.mock('../../../src/lib/npm-helper', () => {
  const orig = jest.requireActual('../../../src/lib/npm-helper')
  return {
    ...orig,
    readPackageJson: jest.fn()
  }
})

jest.mock('@adobe/aio-cli-lib-console')
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')
const mockConsoleCLIInstance = {
  getEnabledServicesForOrg: jest.fn(),
  getOrganizations: jest.fn(),
  promptForSelectOrganization: jest.fn()
}
LibConsoleCLI.init.mockResolvedValue(mockConsoleCLIInstance)

const searchCriteria = {
  statuses: ['Approved'],
  categories: [SEARCH_CRITERIA_FILTER_NOT + 'helper-template']
}

const now = new Date()
const tomorrow = new Date(now.valueOf() + 86400000)
const dayAfter = new Date(tomorrow.valueOf() + 86400000)
const templates = [
  { name: 'foo', description: 'some foo', latestVersion: '1.0.0', status: 'Approved', publishDate: now, adobeRecommended: true, apis: [{ code: 'StockSDK' }, { code: 'ViewSDK' }] },
  { name: 'bar', description: 'some bar', latestVersion: '1.0.1', status: 'Approved', publishDate: tomorrow, adobeRecommended: true },
  { name: 'baz', description: 'some baz', latestVersion: '1.0.2', status: 'Approved', publishDate: dayAfter, adobeRecommended: false, apis: [{ code: 'UserMgmtSDK' }, { code: 'McPlacesSDK' }] }
]
const fakeSupportedOrgServices = [{ code: 'StockSDK', properties: {} }, { code: 'ViewSDK', properties: {} }, { code: 'UserMgmtSDK', properties: {} }, { code: 'McPlacesSDK', properties: {} }]

/**
 * Tests that all returned templates are rendered.
 *
 * @param {Array<string>} splitOutput output split into an array
 */
function testAllTemplatesAreRendered (splitOutput) {
  expect(splitOutput[2]).toMatch('foo')
  expect(splitOutput[3]).toMatch('bar')
  expect(splitOutput[4]).toMatch('baz')
}

let command
let packageJson
const mockAccessToken = 'mock-access-token'

beforeEach(() => {
  packageJson = {}
  console.error = jest.fn()
  readPackageJson.mockReset()
  getTemplates.mockReset()
  command = new TheCommand([])
  command.error = jest.fn()
  command.config = {
    runCommand: jest.fn()
  }
  command.login = jest.fn()
  libEnv.getCliEnv.mockReset()

  readPackageJson.mockImplementation(() => {
    return packageJson
  })
})

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description.length).toBeGreaterThan(0)
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual(['templates:disco'])
})

test('flags', async () => {
  // from BaseComand
  expect(TheCommand.flags.verbose).toBeDefined()

  expect(TheCommand.flags.interactive).toBeDefined()
  expect(TheCommand.flags.interactive.type).toEqual('boolean')

  expect(TheCommand.flags['sort-field']).toBeDefined()
  expect(TheCommand.flags['sort-field'].type).toEqual('option')
  expect(TheCommand.flags['sort-field'].default).toEqual('adobeRecommended')

  expect(TheCommand.flags['sort-order']).toBeDefined()
  expect(TheCommand.flags['sort-order'].type).toEqual('option')
  expect(TheCommand.flags['sort-order'].default).toEqual('desc')
})

test('args', async () => {
  expect(TheCommand.args).toEqual([])
})

describe('sorting', () => {
  const genesis = new Date()
  const later = new Date(genesis.valueOf())
  later.setDate(later.getDate() + 10)

  test('unknown sort-field', async () => {
    command.argv = ['--sort-field', 'unknown']

    await expect(command.run()).rejects
      .toThrow('Expected --sort-field=unknown to be one of: publishDate, names, adobeRecommended\nSee more help with --help')
  })

  test('sort-field=names, ascending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'names', '--sort-order', 'asc']
    const orderByCriteria = {
      names: 'asc'
    }

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    const splitOutput = stdout.output.split('\n')
    testAllTemplatesAreRendered(splitOutput)
  })

  test('sort-field=names, descending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'names', '--sort-order', 'desc']
    const orderByCriteria = {
      names: 'desc'
    }

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    const splitOutput = stdout.output.split('\n')
    testAllTemplatesAreRendered(splitOutput)
  })

  test('sort-field=publishDate, ascending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'publishDate', '--sort-order', 'asc']
    const orderByCriteria = {
      publishDate: 'asc'
    }

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    const splitOutput = stdout.output.split('\n')
    testAllTemplatesAreRendered(splitOutput)
  })

  test('sort-field=publishDate, descending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'publishDate', '--sort-order', 'desc']
    const orderByCriteria = {
      publishDate: 'desc'
    }

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    const splitOutput = stdout.output.split('\n')
    testAllTemplatesAreRendered(splitOutput)
  })
})

describe('interactive install', () => {
  test('normal choices', async () => {
    getTemplates.mockReturnValue(templates)
    libEnv.getCliEnv.mockReturnValue('prod')
    loadConfig.mockResolvedValue(mockAIOConfigJSON)
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(fakeSupportedOrgServices)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    command.accessToken = mockAccessToken
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: ['foo', 'bar']
    })

    packageJson = {
      [TEMPLATE_PACKAGE_JSON_KEY]: ['baz'] // existing template installed
    }

    expect.assertions(4)
    await expect(command.run()).resolves.toEqual(['foo', 'bar'])
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(LibConsoleCLI.init).toHaveBeenCalled()
    const arg = inquirer.prompt.mock.calls[0][0] // first arg of first call
    expect(arg[0].choices.map(elem => elem.value)).toEqual(['foo', 'bar']) // baz was an existing plugin, filtered out
  })

  test('org does not support all services', async () => {
    getTemplates.mockReturnValue(templates)
    libEnv.getCliEnv.mockReturnValue('prod')
    loadConfig.mockResolvedValue(undefined)
    const supportedOrgServices = [{ code: 'ViewSDK', properties: {} }, { code: 'UserMgmtSDK', properties: {} }, { code: 'McPlacesSDK', properties: {} }]
    const fakeOrg = { id: 'fakeorgid', name: 'bestorg' }
    mockConsoleCLIInstance.promptForSelectOrganization.mockResolvedValue(fakeOrg)
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(supportedOrgServices)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    command.accessToken = mockAccessToken
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: ['foo', 'bar']
    })

    packageJson = {
      [TEMPLATE_PACKAGE_JSON_KEY]: ['baz'] // existing template installed
    }

    expect.assertions(5)
    await expect(command.run()).resolves.toEqual(['foo', 'bar'])
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(LibConsoleCLI.init).toHaveBeenCalled()
    const arg = inquirer.prompt.mock.calls[0][0] // first arg of first call
    expect(arg[0].choices.map(elem => elem.value)).toEqual(['foo', 'bar']) // baz was an existing plugin, filtered out
    expect(arg[0].choices.map(elem => elem.disabled)).toEqual([true, false])
  })

  test('all templates are already installed', async () => {
    getTemplates.mockReturnValue(templates)
    libEnv.getCliEnv.mockReturnValue('prod')
    loadConfig.mockResolvedValue(mockAIOConfigJSON)
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(fakeSupportedOrgServices)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    command.accessToken = mockAccessToken
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: ['foo', 'bar', 'baz']
    })

    packageJson = {
      [TEMPLATE_PACKAGE_JSON_KEY]: ['bar', 'foo', 'baz'] // all the installed templates
    }

    expect.assertions(4)
    await expect(command.run()).resolves.toEqual([])
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(LibConsoleCLI.init).toHaveBeenCalled()
    expect(inquirer.prompt).not.toHaveBeenCalled() // should not prompt since there are no templates to install
  })

  test('no choices', async () => {
    getTemplates.mockReturnValue([])
    libEnv.getCliEnv.mockReturnValue('stage')
    loadConfig.mockResolvedValue(mockAIOConfigJSON)
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(fakeSupportedOrgServices)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    command.accessToken = mockAccessToken
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: []
    })

    expect.assertions(3)
    await expect(command.run()).resolves.toEqual([])
    expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(LibConsoleCLI.init).toHaveBeenCalledWith({ accessToken: mockAccessToken, env: 'stage', apiKey: 'aio-cli-console-auth-stage' })
  })

  test('json result error', async () => {
    getTemplates.mockRejectedValueOnce({})

    command.argv = ['-i']

    expect.assertions(2)
    await expect(command.run()).resolves.toBeUndefined()
    expect(command.error).toHaveBeenCalled()
  })
})
