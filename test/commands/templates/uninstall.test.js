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

const TheCommand = require('../../../src/commands/templates/uninstall')
const BaseCommand = require('../../../src/BaseCommand')
const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson, writeObjectToPackageJson } = require('../../../src/lib/npm-helper')

jest.mock('../../../src/lib/helper')
jest.mock('../../../src/lib/npm-helper', () => {
  const orig = jest.requireActual('../../../src/lib/npm-helper')
  return {
    ...orig,
    readPackageJson: jest.fn(),
    writeObjectToPackageJson: jest.fn()
  }
})

let command

beforeEach(() => {
  command = new TheCommand([])
  command.error = jest.fn()

  readPackageJson.mockReset()
  writeObjectToPackageJson.mockReset()
})

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description.length).toBeGreaterThan(0)
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual(['templates:un'])
})

test('flags', async () => {
  expect(Object.keys(TheCommand.flags)).toMatchObject(Object.keys(BaseCommand.flags))
})

test('args', async () => {
  expect(TheCommand.args).toBeDefined()
  expect(TheCommand.args).toBeInstanceOf(Array)
  expect(TheCommand.args.length).toEqual(1)

  expect(TheCommand.args[0].name).toEqual('package-name')
})

describe('run', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('uninstall (template is installed)', () => {
    const templateName = 'my-template'
    command.argv = [templateName]

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: '^1.0.0'
      },
      [TEMPLATE_PACKAGE_JSON_KEY]: [
        templateName
      ]
    })

    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(writeObjectToPackageJson).toHaveBeenCalledWith({
            [TEMPLATE_PACKAGE_JSON_KEY]: []
          })
          resolve()
        })
    })
  })

  test('uninstall (template is not installed)', () => {
    const templateName = 'my-template'
    command.argv = [templateName]

    readPackageJson.mockResolvedValue({
      dependencies: {
        [templateName]: '^1.0.0'
      }
    })

    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(command.error).toHaveBeenCalledWith(`template ${templateName} is not installed.`)
          resolve()
        })
    })
  })
})
