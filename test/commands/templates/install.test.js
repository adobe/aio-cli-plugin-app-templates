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

const TheCommand = require('../../../src/commands/templates/install')
const BaseCommand = require('../../../src/BaseCommand')
const { runScript } = require('../../../src/lib/helper')
const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson, writeObjectToPackageJson, getNpmDependency } = require('../../../src/lib/npm-helper')

// mock project-installation calls
jest.mock('@adobe/aio-lib-console-project-installation')
const TemplateHandler = require('@adobe/aio-lib-console-project-installation')
const mockTemplateHandlerInstance = {
  installTemplate: jest.fn()
}
TemplateHandler.init.mockResolvedValue(mockTemplateHandlerInstance)

// mock app config calls
jest.mock('@adobe/aio-cli-lib-app-config')
const loadConfig = require('@adobe/aio-cli-lib-app-config')
const mockAIOConfigJSON = JSON.parse('{"aio": {"project": {"id": "project-id","org": {"id": "org-id"}}}}')
loadConfig.mockImplementation(() => mockAIOConfigJSON)

// mock ims calls
jest.mock('@adobe/aio-lib-ims', () => ({
  getToken: jest.fn(),
  context: {
    setCli: jest.fn()
  }
}))
const Ims = require('@adobe/aio-lib-ims')
Ims.context.setCli.mockReset()
Ims.getToken.mockReset()
Ims.getToken.mockResolvedValue('bowling')

// mock generators
jest.mock('yeoman-environment')
const yeoman = require('yeoman-environment')
const yeomanEnvInstantiate = jest.fn()
const yeomanEnvOptionsGet = jest.fn()
const yeomanEnvOptionsSet = jest.fn()
const createEnvReturnValue = {
  instantiate: yeomanEnvInstantiate,
  runGenerator: jest.fn()
}
Object.defineProperty(createEnvReturnValue, 'options', {
  get: yeomanEnvOptionsGet,
  set: yeomanEnvOptionsSet
})
yeoman.createEnv.mockReturnValue(createEnvReturnValue)

jest.mock('my-adobe-template-path', () => ({}), { virtual: true })
jest.mock('my-adobe-package-path', () => ({}), { virtual: true })

jest.mock('../../../src/lib/helper')
jest.mock('../../../src/lib/npm-helper', () => {
  const orig = jest.requireActual('../../../src/lib/npm-helper')
  return {
    ...orig,
    readPackageJson: jest.fn(),
    writeObjectToPackageJson: jest.fn(),
    getNpmDependency: jest.fn()
  }
})

const { stdout } = require('stdout-stderr')
const { getTemplateRequiredServiceNames } = require('../../../src/lib/template-helper')
jest.mock('../../../src/lib/template-helper')

let command

beforeEach(() => {
  command = new TheCommand([])
  jest.clearAllMocks()
})

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description.length).toBeGreaterThan(0)
})

test('examples', async () => {
  expect(TheCommand.examples.length).toBeGreaterThan(0)
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual(['templates:i'])
})

test('flags', () => {
  expect(Object.keys(TheCommand.flags)).toEqual(expect.arrayContaining(Object.keys(BaseCommand.flags)))

  expect(TheCommand.flags.yes).toBeDefined()
  expect(TheCommand.flags.yes.type).toBe('boolean')
  expect(TheCommand.flags.yes.default).toBe(false)

  expect(TheCommand.flags.install).toBeDefined()
  expect(TheCommand.flags.install.type).toBe('boolean')
  expect(TheCommand.flags.install.default).toBe(true)
  expect(TheCommand.flags.install.allowNo).toBe(true)

  expect(TheCommand.flags['process-install-config']).toBeDefined()
  expect(TheCommand.flags['process-install-config'].type).toBe('boolean')
  expect(TheCommand.flags['process-install-config'].default).toBe(true)
  expect(TheCommand.flags['process-install-config'].allowNo).toBe(true)

  expect(TheCommand.flags['template-options']).toBeDefined()
  expect(TheCommand.flags['template-options'].type).toBe('option')
})

test('args', async () => {
  expect(TheCommand.args).toBeDefined()
  expect(TheCommand.args).toBeInstanceOf(Array)
  expect(TheCommand.args.length).toEqual(1)

  expect(TheCommand.args[0].name).toEqual('path')
})

describe('run', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('install from https', async () => {
    const templateName = 'my-adobe-template'
    const argPath = `https://github.com/adobe/${templateName}`
    command.argv = [argPath]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: `git+${command.argv[0]}.git`
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', argPath])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name', async () => {
    const templateName = 'my-adobe-package'
    command.argv = [templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name skipping prompts', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--yes', templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': true, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name skipping running npm installation', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--no-install', templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: true })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name with --install', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--install', templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name skipping processing install.yml', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--no-process-install-config', templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])
    getTemplateRequiredServiceNames.mockReturnValueOnce(['runtime', 'GraphQLServiceSDK', 'AssetComputeSDK'])

    expect.assertions(9)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).not.toBeCalled()
    expect(getTemplateRequiredServiceNames).toBeCalledWith(templateName)
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
    expect(stdout.output).toMatch('Please check the following template dependencies, that should be met by Adobe Console project workspaces:')
    expect(stdout.output).toMatch('runtime, GraphQLServiceSDK, AssetComputeSDK')
  })

  test('install from package name skipping processing install.yml with no template services', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--no-process-install-config', templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])
    getTemplateRequiredServiceNames.mockReturnValueOnce([])

    expect.assertions(8)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).not.toBeCalled()
    expect(getTemplateRequiredServiceNames).toBeCalledWith(templateName)
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
    expect(stdout.output).not.toMatch('Please check the following template dependencies, that should be met by Adobe Console project workspaces:')
  })

  test('install from package name - already installed', async () => {
    const templateName = 'my-adobe-package'
    command.argv = [templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      },
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).not.toHaveBeenCalled()
  })

  test('fail install from package name, no project details', async () => {
    loadConfig.mockResolvedValueOnce(() => {})
    const templateName = 'my-adobe-package'
    command.argv = [templateName]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(2)
    await expect(command.run()).rejects.toThrowError('Error installing template: Missing orgId or projectId in project configuration')
    expect(mockTemplateHandlerInstance.installTemplate).not.toBeCalled()
  })
})

describe('template-options', () => {
  test('no flag', async () => {
    const templateName = 'my-adobe-package'
    const argPath = `https://github.com/adobe/${templateName}`
    command.argv = [argPath]

    readPackageJson.mockResolvedValueOnce({
      dependencies: {
        [templateName]: `git+${command.argv[0]}.git`
      }
    })

    getNpmDependency.mockResolvedValueOnce([templateName, '1.0.0'])

    expect.assertions(7)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', argPath])
    expect(yeomanEnvInstantiate).toBeCalledWith(expect.any(Object), { options: { 'skip-prompt': false, force: true } })
    expect(yeomanEnvOptionsSet).toBeCalledWith({ skipInstall: false })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(getTemplateRequiredServiceNames).not.toBeCalled()
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('invalid base64', async () => {
    const templateName = 'my-adobe-package'
    const argPath = `https://github.com/adobe/${templateName}`
    command.argv = [argPath, '--template-options=%'] // % is an invalid base64 character

    expect.assertions(1)
    await expect(command.run()).rejects.toThrow('--template-options: % is not a base64 encoded JSON object.')
  })

  test('malformed json', async () => {
    const templateName = 'my-adobe-package'
    const argPath = `https://github.com/adobe/${templateName}`
    const options = '{' // ew== in base64
    command.argv = [argPath, `--template-options=${Buffer.from(options).toString('base64')}`]

    expect.assertions(1)
    await expect(command.run()).rejects.toThrow('--template-options: ew== is not a base64 encoded JSON object.')
  })
})
