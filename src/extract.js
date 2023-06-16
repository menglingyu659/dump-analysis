const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const compressing = require('compressing');
const { getPaths, localDistDir, isDebugReg } = require('./var');
const { uploadToCdn } = require('../tos');
const extractSymbol = require('./extractSymbol');

const extract = async (debugSymbolsNameAndPath, arch) => {
  const { uploadZipFileBasePath, uploadSymbolsAroundBasePath, localSymbolsDir, localZipDir } = getPaths(arch);
  if (!existsSync(localDistDir)) {
    mkdirSync(localDistDir);
  }
  if (!existsSync(localSymbolsDir)) {
    mkdirSync(localSymbolsDir);
  }
  for (const [debugSymbolName, debugSymbolPath] of Array.isArray(debugSymbolsNameAndPath) ?
    debugSymbolsNameAndPath :
    [debugSymbolsNameAndPath]) {
    const matchName = debugSymbolName.match(isDebugReg);
    if (!matchName) {
      continue;
    }
    const { stdout } = await extractSymbol(debugSymbolPath, arch);
    const peName = matchName[1];
    const peDir = path.join(localSymbolsDir, peName);
    const idDir = path.join(peDir, stdout.split('\n')[0].split(' ')[3]);
    if (!existsSync(peDir)) {
      mkdirSync(peDir);
    }
    if (!existsSync(idDir)) {
      mkdirSync(idDir);
    }
    writeFileSync(path.join(idDir, `${peName}.sym`), stdout);
  }
  const localZipSymbolPathName = path.join(localZipDir, `${uploadZipFileBasePath}-symbols.zip`);
  if (!existsSync(localZipDir)) {
    mkdirSync(localZipDir);
  }
  await compressing.zip.compressDir(localSymbolsDir, localZipSymbolPathName);
  await uploadToCdn(
    localZipSymbolPathName,
    path.join(uploadSymbolsAroundBasePath, `${uploadZipFileBasePath}-symbols.zip`)
  );
};

module.exports = { extract };
