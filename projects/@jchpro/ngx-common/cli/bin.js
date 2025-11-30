#!/usr/bin/env node

const { Command } = require('commander');
const { env2config } = require('./env2config/cli');

// Program
const program = new Command()
  .name('jchpro-ngx')
  .description('CLI with various utilities for Angular projects');

// env2config
program
  .command('env2config')
  .description('Reads .env files in the Angular projects root directory and creates JSON file with config in the project codebase')
  .argument('<project>', 'Name of the Angular project, as defined in angular.json')
  .option('-d, --doOverride', 'Processes and merges additional .env file defined by <overrideFile> with overridden variables, disabled by default', false)
  .option('-c, --configFilePath <configFilePath>', 'Path to the output JSON along with its\'s name, relative to the projects\' source directory', 'config.json')
  .option('-o, --overrideFile <overrideFile>', 'Name of the override .env file', '.env.override')
  .option('-e, --exclude <exclude...>', 'Array of names of read environment variables which should be excluded from the config JSON', [])
  .action(env2config);

// Parse and run CLI
program.parseAsync()
  .catch(err => console.error(err));
