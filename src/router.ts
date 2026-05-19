import path from "path";

import { emitRouteTypes } from "./emit-types";
import { Logger, createLogger } from "./logger";
import { scanRouteFiles } from "./scan";
import { buildRouteTree, composeAppFromTree } from "./tree";
import {
  LogLevel,
  RouteNode,
  RouteTree,
  RouterOptions,
  ScanResult,
  ScanResultStatus,
} from "./types";

const stringifyRouteNode = (
  node: RouteNode,
  prefix = "",
  isLast = false
): string => {
  return (
    prefix +
    `${isLast || node.kind === "root" ? "└" : "├"}─ /${node.segment} ${node.files.length ? "(" + node.files.join() + ")" : ""} \x1b[2m- ${node.kind}\x1b[0m\n` +
    Array.from(node.children.values())
      .map((child, i, arr) =>
        stringifyRouteNode(
          child,
          prefix + (isLast || node.kind === "root" ? "   " : "│  "),
          arr.length - 1 === i
        )
      )
      .join("")
  );
};

const printRouteTree = (logger: Logger, tree: RouteTree) => {
  logger.info("route tree:\n" + stringifyRouteNode(tree.root));
};

const printScanResults = (logger: Logger, results: ScanResult[]) => {
  const loaded = results.filter(
    (res) => res.status === ScanResultStatus.Loaded
  );
  const skipped = results.filter(
    (res) => res.status === ScanResultStatus.Skipped
  );
  const errors = results.filter((res) => res.status === ScanResultStatus.Error);

  logger.info(
    `scan complete: ${loaded.length} loaded, ${skipped.length} skipped, ${errors.length} errors`
  );

  loaded.forEach((res) => logger.verbose("loaded", res.filePath));
  skipped.forEach((res) =>
    logger.verbose(
      "skipped",
      res.filePath,
      (res as { reason: string | Error }).reason
    )
  );
  errors.forEach((res) =>
    logger.error(
      "error",
      res.filePath,
      (res as { reason: string | Error }).reason
    )
  );
};

export const fsr = async (options?: Partial<RouterOptions>) => {
  const finalOptions: RouterOptions = {
    dir: "./routes",
    filter: "**/*.{ts,tsx,js,jsx,mjs,cjs}",
    logLevel: LogLevel.Default,
    types: true,
    ...options,
  };

  finalOptions.dir = path.resolve(path.dirname(Bun.main), finalOptions.dir);

  const logger = createLogger(finalOptions.logLevel);
  logger.verbose("options", finalOptions);
  logger.info("scanning routes in", finalOptions.dir);

  const scanLogger = logger.child("scan");
  const scanRes = await scanRouteFiles(finalOptions, scanLogger);
  printScanResults(scanLogger, scanRes);

  const tree = buildRouteTree(scanRes);
  printRouteTree(logger.child("tree"), tree);
  const app = composeAppFromTree(tree);
  const outputFilePath = await emitRouteTypes(tree, scanRes, finalOptions);
  if (outputFilePath) logger.info("types emitted to", outputFilePath);

  return app;
};
