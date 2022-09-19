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

const helper = require('../../src/lib/helper')
const execa = require('execa')
const inquirer = require('inquirer')
const { EventEmitter } = require('jest-haste-map')

jest.mock('execa')
jest.mock('inquirer')
jest.mock('@adobe/aio-lib-core-logging', () => {
  return jest.fn().mockImplementation(() => {
    return {
      debug: jest.fn()
    }
  })
})
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-helper', { provider: 'debug' })

beforeEach(() => {
  execa.command.mockReset()
  aioLogger.debug.mockReset()
})

describe('sort tests', () => {
  const now = new Date().valueOf()

  const descendingDate = [
    new Date(now + 110),
    new Date(now + 100),
    new Date(now - 50),
    new Date(now - 80),
    new Date(now - 100)
  ]

  const ascendingDate = [
    new Date(now - 100),
    new Date(now - 80),
    new Date(now - 50),
    new Date(now + 100),
    new Date(now + 110)
  ]

  const descendingName = ['Zoltan', 'Siobhan', 'Saoirse', 'Deidre', 'Aiofe']
  const ascendingName = ['Aiofe', 'Deidre', 'Saoirse', 'Siobhan', 'Zoltan']

  const descendingName2 = ['Zoltan', 'Saoirse', 'Saoirse', 'Deidre', 'Aiofe'] // has a duplicate entry
  const ascendingName2 = ['Aiofe', 'Deidre', 'Saoirse', 'Saoirse', 'Zoltan'] // has a duplicate entry

  test('sort defaults (descending, date)', () => {
    const toSort = [
      { date: descendingDate[2] },
      { date: descendingDate[3] },
      { date: descendingDate[4] },
      { date: descendingDate[0] },
      { date: descendingDate[1] }
    ]
    helper.sortValues(toSort)

    const expectedSort = [
      { date: descendingDate[0] },
      { date: descendingDate[1] },
      { date: descendingDate[2] },
      { date: descendingDate[3] },
      { date: descendingDate[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort defaults (ascending, date)', () => {
    const toSort = [
      { date: ascendingDate[2] },
      { date: ascendingDate[3] },
      { date: ascendingDate[4] },
      { date: ascendingDate[0] },
      { date: ascendingDate[1] }
    ]
    helper.sortValues(toSort, { descending: false })

    const expectedSort = [
      { date: ascendingDate[0] },
      { date: ascendingDate[1] },
      { date: ascendingDate[2] },
      { date: ascendingDate[3] },
      { date: ascendingDate[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort (descending, name)', () => {
    const toSort = [
      { name: descendingName[2] },
      { name: descendingName[3] },
      { name: descendingName[4] },
      { name: descendingName[0] },
      { name: descendingName[1] }
    ]
    helper.sortValues(toSort, { field: 'name' })

    const expectedSort = [
      { name: descendingName[0] },
      { name: descendingName[1] },
      { name: descendingName[2] },
      { name: descendingName[3] },
      { name: descendingName[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort with duplicate entry, for coverage (descending, name)', () => {
    const toSort = [
      { name: descendingName2[2] },
      { name: descendingName2[3] },
      { name: descendingName2[4] },
      { name: descendingName2[0] },
      { name: descendingName2[1] }
    ]
    helper.sortValues(toSort, { field: 'name' })

    const expectedSort = [
      { name: descendingName2[0] },
      { name: descendingName2[1] },
      { name: descendingName2[2] },
      { name: descendingName2[3] },
      { name: descendingName2[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort with duplicate entry, for coverage (ascending, name)', () => {
    const toSort = [
      { name: ascendingName2[2] },
      { name: ascendingName2[3] },
      { name: ascendingName2[4] },
      { name: ascendingName2[0] },
      { name: ascendingName2[1] }
    ]
    helper.sortValues(toSort, { descending: false, field: 'name' })

    const expectedSort = [
      { name: ascendingName2[0] },
      { name: ascendingName2[1] },
      { name: ascendingName2[2] },
      { name: ascendingName2[3] },
      { name: ascendingName2[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort (ascending, name)', () => {
    const toSort = [
      { name: ascendingName[2] },
      { name: ascendingName[3] },
      { name: ascendingName[4] },
      { name: ascendingName[0] },
      { name: ascendingName[1] }
    ]
    helper.sortValues(toSort, { descending: false, field: 'name' })

    const expectedSort = [
      { name: ascendingName[0] },
      { name: ascendingName[1] },
      { name: ascendingName[2] },
      { name: ascendingName[3] },
      { name: ascendingName[4] }
    ]

    expect(toSort).toEqual(expectedSort)
  })

  test('sort (unknown field)', () => {
    const toSort = [
      { name: ascendingName[2] },
      { name: ascendingName[3] },
      { name: ascendingName[4] },
      { name: ascendingName[0] },
      { name: ascendingName[1] }
    ]
    helper.sortValues(toSort, { field: 'unknown-field' })

    // unknown field, it should return the unsorted array
    const expectedSort = [
      { name: ascendingName[2] },
      { name: ascendingName[3] },
      { name: ascendingName[4] },
      { name: ascendingName[0] },
      { name: ascendingName[1] }
    ]

    expect(toSort).toEqual(expectedSort)
  })
})

describe('runScript tests', () => {
  test('runScript with empty command', async () => {
    await helper.runScript(undefined, 'dir')
    expect(execa.command).not.toHaveBeenCalled()
  })

  test('runScript with defined dir', async () => {
    execa.command.mockReturnValue({ on: () => { } })
    await helper.runScript('somecommand', 'somedir')
    expect(execa.command).toHaveBeenCalledWith('somecommand', expect.objectContaining({ cwd: 'somedir' }))
  })

  test('runScript with empty dir => process.cwd', async () => {
    execa.command.mockReturnValue({ on: () => { } })
    await helper.runScript('somecommand', undefined)
    expect(execa.command).toHaveBeenCalledWith('somecommand', expect.objectContaining({ cwd: process.cwd() }))
  })

  test('runScript with command args', async () => {
    execa.command.mockReturnValue({ on: () => { } })
    await helper.runScript('somecommand', undefined, ['install', '/path/to/dir'])
    expect(execa.command).toHaveBeenCalledWith('somecommand install /path/to/dir', expect.objectContaining({ cwd: process.cwd() }))
  })
})

const describeIfCondition = process.platform !== 'win32' ? describe : describe.skip

describeIfCondition('check event emitter', () => {
  test('runScript, handle IPC from possible aio-run-detached script', async () => {
    const message = {
      type: 'long-running-process',
      data: {
        pid: 3242424,
        logs: {
          stdout: 'mock-stdout',
          stderr: 'mock-stderr'
        }
      }
    }
    const mockProcess = new EventEmitter()
    execa.command.mockReturnValue(mockProcess)
    const childProcess = await helper.runScript('somecommand', 'somedir')
    expect(execa.command).toHaveBeenCalledWith('somecommand', expect.objectContaining({ cwd: 'somedir' }))
    expect(childProcess).toEqual(mockProcess)
    mockProcess.emit('message', message)

    const mockExit = jest.spyOn(process, 'kill').mockImplementation(() => {})
    process.emit('exit', 'SIGTERM')
    expect(mockExit).toHaveBeenCalled()
    expect(process.kill).toHaveBeenCalledWith(message.data.pid, 'SIGTERM')
  })

  test('runScript, non long running process', async () => {
    const message = {
      type: 'non-long-running-process',
      data: {
        pid: 3242424,
        logs: {
          stdout: 'mock-stdout',
          stderr: 'mock-stderr'
        }
      }
    }
    const mockProcess = new EventEmitter()
    execa.command.mockReturnValue(mockProcess)
    const childProcess = await helper.runScript('somecommand', 'somedir')
    expect(execa.command).toHaveBeenCalledWith('somecommand', expect.objectContaining({ cwd: 'somedir' }))
    expect(childProcess).toEqual(mockProcess)
    mockProcess.emit('message', message)

    const mockExit = jest.spyOn(process, 'kill').mockImplementation(() => {})
    process.emit('exit', 'SIGTERM')
    expect(mockExit).toHaveBeenCalled()
  })
})

describe('prompt', () => {
  test('prompt', async () => {
    inquirer.prompt = jest.fn().mockResolvedValue({
      confirm: true
    })
    await expect(helper.prompt()).resolves.toEqual(true)
  })
})

describe('runScript on Windows platform', () => {
  beforeAll(() => {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })
  })
  afterAll(() => {
    Object.defineProperty(process, 'platform', this.originalPlatform)
  })
  test('process.platform is Windows', async () => {
    expect(process.platform).toEqual('win32')
  })
  test('disable IPC for Windows', async () => {
    await helper.runScript('somecommand', 'somedir')
    expect(execa.command).toHaveBeenCalledWith('somecommand', expect.objectContaining({ stdio: ['inherit', 'inherit', 'inherit', null] }))
  })
})
