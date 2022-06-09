/*
Copyright 2022 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const HHelp = require('@oclif/plugin-help').default
const { Command } = require('@oclif/command')

class TemplateCommand extends Command {
  async run () {
    const help = new HHelp(this.config)
    help.showHelp(['templates', '--help'])
  }
}

TemplateCommand.description = 'Discover, or install a new template into an existing Adobe Developer App Builder App'

module.exports = TemplateCommand
