import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import compressing from "compressing";
import { getPaths, localDistDir, isDebugReg } from "./var";
// import { uploadToCdn } from "../tos";
import extractSymbol from "./extractSymbol";

const extract = async (debugSymbolsNameAndPath: string, arch: string) => {
  const {
    uploadZipFileBasePath,
    uploadSymbolsAroundBasePath,
    localSymbolsDir,
    localZipDir,
  } = getPaths(arch);
  if (!existsSync(localDistDir)) {
    mkdirSync(localDistDir);
  }
  if (!existsSync(localSymbolsDir)) {
    mkdirSync(localSymbolsDir);
  }
  for (const [debugSymbolName, debugSymbolPath] of Array.isArray(
    debugSymbolsNameAndPath
  )
    ? debugSymbolsNameAndPath
    : [debugSymbolsNameAndPath]) {
    const matchName = debugSymbolName.match(isDebugReg);
    if (!matchName) {
      continue;
    }
    const { stdout } = await extractSymbol(debugSymbolPath, arch);
    const peName = matchName[1];
    const peDir = path.join(localSymbolsDir, peName);
    const idDir = path.join(peDir, stdout.split("\n")[0].split(" ")[3]);
    if (!existsSync(peDir)) {
      mkdirSync(peDir);
    }
    if (!existsSync(idDir)) {
      mkdirSync(idDir);
    }
    writeFileSync(path.join(idDir, `${peName}.sym`), stdout);
  }
  const localZipSymbolPathName = path.join(
    localZipDir,
    `${uploadZipFileBasePath}-symbols.zip`
  );
  if (!existsSync(localZipDir)) {
    mkdirSync(localZipDir);
  }
  await compressing.zip.compressDir(localSymbolsDir, localZipSymbolPathName);
  // await uploadToCdn(
  //   localZipSymbolPathName,
  //   path.join(
  //     uploadSymbolsAroundBasePath,
  //     `${uploadZipFileBasePath}-symbols.zip`
  //   )
  // );
};

export { extract };
