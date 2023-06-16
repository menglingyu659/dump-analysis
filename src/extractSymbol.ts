import { execFile } from "child_process";
import { promisify } from "util";
import { commands } from "./var";

const executeFile = (command: string, args: string[]) =>
  promisify(execFile)(command, args, { maxBuffer: Infinity });
const dumpsyms = commands.dump_syms;

const windowsPEList = ["", ".exe", ".dll", ".node"];
export default (path: string, arch: string) => {
  if (process.platform === "win32" && arch === "ia32") {
    return executeFile(dumpsyms, [path]);
  } else if (process.platform === "win32") {
    const _ = async (num = 0) => {
      try {
        return await executeFile(dumpsyms, [
          path.replace(".pdb", windowsPEList[num]),
        ]);
      } catch (error: any) {
        if (
          error &&
          error.message &&
          error.message.includes("loadDataForPdb and loadDataFromExe failed") &&
          num < windowsPEList.length - 1
        ) {
          return _(++num);
        } else {
          throw error;
        }
      }
    };
    return _();
  } else if (process.platform === "linux") {
    return executeFile(dumpsyms, ["-r", "-c", path.replace(".debug", "")]);
  } else {
    return executeFile(dumpsyms, ["-r", "-c", path]);
  }
};
