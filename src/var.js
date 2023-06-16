const path = require("path");

const localDistDir = path.join(__dirname, "dist");

const outputDir = path.join(__dirname, "../../dist/assets");

const isDebugReg = /(.*?)\.(dSYM|pdb|debug)$/;

const exe = process.platform === "win32" ? ".exe" : "";
const binDir = path.join(
  __dirname,
  "bin",
  `${process.platform}-${process.arch}`
);
const commands = {
  dump_syms: path.join(binDir, "dump_syms") + exe,
};
const systemArch = ["arm64", "x64", "ia32"];

module.exports.localDistDir = localDistDir;
module.exports.systemArch = systemArch;
module.exports.commands = commands;
module.exports.outputDir = outputDir;
module.exports.isDebugReg = isDebugReg;
module.exports.getPaths = (arch) => {
  const localPADir = path.join(localDistDir, `${process.platform}-${arch}`);
  const localZipDir = path.join(localPADir, "zip");
  const localDebugDir = path.join(localPADir, "debug");
  const localSymbolsDir = path.join(localPADir, "symbols");
  return {
    localZipDir,
    localPADir,
    localSymbolsDir,
    localDebugDir,
  };
};
