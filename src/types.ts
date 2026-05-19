import Elysia from "elysia";

export enum LogLevel {
  Silent = -1,
  Default = 0,
  Verbose = 1,
}

export type RouterOptions = {
  dir: string;
  filter: string;
  logLevel: LogLevel;
  types:
    | boolean
    | {
        dir: string;
        importAlias?: string;
      };
};

export enum ScanResultStatus {
  Loaded,
  Skipped,
  Error,
}

export type LoadRouteModuleResult<T> =
  | ({
      status: ScanResultStatus.Loaded;
      app: Elysia;
    } & T)
  | {
      status: ScanResultStatus.Error | ScanResultStatus.Skipped;
      reason: string | Error;
    };

export type ScanResult = {
  filePath: string;
} & LoadRouteModuleResult<{ routeSegments: string[] }>;

export type SegmentKind = "root" | "static" | "param" | "wildcard" | "ghost";

export type RouteNode = {
  kind: SegmentKind;
  segment: string;
  children: Map<string, RouteNode>;
  apps: Elysia[];
  files: string[];
};

export type RouteTree = { root: RouteNode };
