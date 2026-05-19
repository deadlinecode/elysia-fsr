import Elysia from "elysia";

import {
  RouteNode,
  RouteTree,
  ScanResult,
  ScanResultStatus,
  SegmentKind,
} from "./types";

export const createNode = (segment: string, kind: SegmentKind): RouteNode => ({
  kind,
  segment,
  apps: [],
  files: [],
  children: new Map(),
});

export const createRouteTree = (): RouteTree => ({
  root: createNode("", "root"),
});

export const getNodeKind = (segment: string): SegmentKind =>
  segment.startsWith(":")
    ? "param"
    : segment.startsWith("*")
      ? "wildcard"
      : segment.startsWith("(") && segment.endsWith(")")
        ? "ghost"
        : segment
          ? "static"
          : "root";

export const getOrCreateChild = (parent: RouteNode, segment: string) => {
  let child = parent.children.get(segment);
  if (child) return child;
  child = createNode(segment, getNodeKind(segment));
  parent.children.set(segment, child);
  return child;
};

export const insertRoute = (tree: RouteTree, result: ScanResult) => {
  if (result.status !== ScanResultStatus.Loaded) {
    return;
  }
  if (!result.routeSegments.length) {
    tree.root.apps.push(result.app);
    tree.root.files.push(result.filePath);
    return;
  }
  const finalNode = result.routeSegments.reduce(
    (node, segment) => getOrCreateChild(node, segment),
    tree.root
  );
  finalNode.apps.push(result.app);
  finalNode.files.push(result.filePath);
};

export const buildRouteTree = (results: ScanResult[]): RouteTree => {
  const tree = createRouteTree();
  results.forEach((res) => insertRoute(tree, res));
  return tree;
};

export const mergeApps = (apps: Elysia[], root = new Elysia()) => {
  apps.forEach((app) => root.use(app));
  return root;
};

export const composeNode = (node: RouteNode) => {
  const app =
    node.kind === "ghost"
      ? mergeApps(node.apps.slice(1), node.apps.at(0))
      : mergeApps(node.apps);

  node.children
    .values()
    .forEach((child) =>
      child.kind === "ghost"
        ? app.use(composeNode(child))
        : app.use(new Elysia({ prefix: child.segment }).use(composeNode(child)))
    );

  return app;
};

export const composeAppFromTree = (tree: RouteTree, baseApp = new Elysia()) =>
  baseApp.use(composeNode(tree.root));
