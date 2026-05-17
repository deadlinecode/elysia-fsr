import Elysia from "elysia";
import { type RouterOptions, type ScanResult, ScanResultStatus } from "./types";
import path from "path";
import { filePathToRouteSegments } from "./path";

export const loadRouteModule = (filePath: string) =>
  import(filePath).then((mod) => ({ mod })).catch((err) => ({ err }));

export const scanRouteFiles = async (options: RouterOptions) => {
  const glob = new Bun.Glob(options.filter);
  const scanResults: ScanResult[] = [];
  for await (const filePath of glob.scan(options.dir)) {
    const absPath = path.join(path.resolve(options.dir), filePath);
    const modRes = await loadRouteModule(absPath);
    if ("err" in modRes) {
      scanResults.push({
        filePath,
        status: ScanResultStatus.Error,
        reason: modRes.err,
      });
      continue;
    }

    const { mod } = modRes;

    if (!("default" in mod)) {
      scanResults.push({
        filePath,
        status: ScanResultStatus.Skipped,
        reason: "No default export found",
      });
      continue;
    }
    if (!(mod.default instanceof Elysia)) {
      scanResults.push({
        filePath,
        status: ScanResultStatus.Skipped,
        reason: "Default export is not a instance of elysia",
      });
      continue;
    }

    scanResults.push({
      filePath,
      status: ScanResultStatus.Loaded,
      routeSegments: filePathToRouteSegments(filePath),
      app: mod.default,
    });
  }
  return scanResults;
};
