import { emitRouteTypes } from "./emit-types";
import { createLogger, Logger } from "./logger";
import { scanRouteFiles } from "./scan";
import { buildRouteTree, composeAppFromTree } from "./tree";
import { LogLevel, RouteNode, RouterOptions, RouteTree } from "./types";

const stringifyRouteNode = (
  node: RouteNode,
  prefix = "",
  isLast = false
): string => {
  return (
    prefix +
    `${isLast || node.kind === "root" ? "└" : "├"}─ /${node.segment} ${node.files.length ? "(" + node.files.join() + ")" : ""}\n` +
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

export const fsr = async (options?: Partial<RouterOptions>) => {
  let finalOptions: RouterOptions = {
    dir: "./routes",
    filter: "**/*.{ts,tsx,js,jsx,mjs,cjs}",
    logLevel: LogLevel.Default,
    types: true,
    ...options,
  };

  const logger = createLogger(finalOptions.logLevel);
  const scanRes = await scanRouteFiles(finalOptions);
  const tree = buildRouteTree(scanRes);
  printRouteTree(logger, tree);
  const app = composeAppFromTree(tree);
  await emitRouteTypes(tree, scanRes, finalOptions);

  return app;
};
