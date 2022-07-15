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
const yeomanEnvRun = jest.fn()
yeoman.createEnv.mockReturnValue({
  register: jest.fn(),
  run: yeomanEnvRun
})

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

let command

beforeEach(() => {
  command = new TheCommand([])

  readPackageJson.mockReset()
  writeObjectToPackageJson.mockReset()
  getNpmDependency.mockReset()
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

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: `git+${command.argv[0]}.git`
      }
    })

    getNpmDependency.mockResolvedValue([templateName, '1.0.0'])

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', argPath])
    expect(yeomanEnvRun).toBeCalledWith('template-to-run', { options: { 'skip-prompt': false, force: true, 'skip-install': true } })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name', async () => {
    const templateName = 'my-adobe-package'
    command.argv = [templateName]

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValue([templateName, '1.0.0'])

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvRun).toBeCalledWith('template-to-run', { options: { 'skip-prompt': false, force: true, 'skip-install': true } })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name skipping prompts', async () => {
    const templateName = 'my-adobe-package'
    command.argv = ['--yes', templateName]

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    getNpmDependency.mockResolvedValue([templateName, '1.0.0'])

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvRun).toBeCalledWith('template-to-run', { options: { 'skip-prompt': true, force: true, 'skip-install': true } })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(writeObjectToPackageJson).toBeCalledWith({
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })
  })

  test('install from package name - already installed', async () => {
    const templateName = 'my-adobe-package'
    command.argv = [templateName]

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: '^1.0.0'
      },
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })

    getNpmDependency.mockResolvedValue([templateName, '1.0.0'])

    expect.assertions(5)
    await expect(command.run()).resolves.toBeUndefined()
    expect(runScript).toBeCalledWith('npm', process.cwd(), ['install', templateName])
    expect(yeomanEnvRun).toBeCalledWith('template-to-run', { options: { 'skip-prompt': false, force: true, 'skip-install': true } })
    expect(mockTemplateHandlerInstance.installTemplate).toBeCalledWith('org-id', 'project-id')
    expect(writeObjectToPackageJson).not.toHaveBeenCalled()
  })
})
