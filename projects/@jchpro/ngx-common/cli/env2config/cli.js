const { readFile, writeFile } = require('fs/promises');
const { resolve, join } = require('path');
const dotenv = require('dotenv').config;

const cwd = process.cwd();
const NG_FILE = 'angular.json';

module.exports.env2config = async (project, {
  doOverride,
  configFilePath,
  overrideFile,
  exclude
}) => {

  // Resolve project
  const ngFile = await readJsonFile(resolve(cwd, NG_FILE));
  if (!ngFile.projects[project]) {
    console.error(`No such project: ${project}`);
    process.exit(1);
  }
  const ngProject = ngFile.projects[project];

  // Resolve directory paths
  const rootDir = resolve(cwd, ngProject.root);
  const sourceDir = resolve(cwd, ngProject.sourceRoot);

  // Resolve file paths
  const overridePath = join(rootDir, overrideFile);
  const outputPath = resolve(sourceDir, configFilePath);

  // Resolve main config
  const mainConfig = dotenv({ path: resolve(rootDir, '.env') });
  let mergedConfig = {
    ...mainConfig.parsed,
  };

  // Resolve overrides if defined
  if (doOverride) {
    const overrideConfig = dotenv({ path: overridePath });
    mergedConfig = {
      ...mergedConfig,
      ...overrideConfig.parsed
    };
  }

  // Exclude variables if necessary
  if (exclude.length) {
    mergedConfig = Object
      .keys(mergedConfig)
      .reduce((obj, key) => {
        if (exclude.includes(key)) {
          return obj;
        }
        return { ...obj, [key]: mergedConfig[key] };
      }, {});
  }

  // Warn if object is empty
  if (Object.keys(mergedConfig).length === 0) {
    console.warn(`Config object is empty!`);
  }

  // Write file
  await writeFile(
    outputPath,
    JSON.stringify(mergedConfig),
    'utf-8'
  );

}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, 'utf-8'));
}
