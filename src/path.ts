import path from "path";

export const stripExtension = (filePath: string) => {
  const ext = path.extname(filePath);
  if (!ext) return filePath;
  return filePath.slice(0, -ext.length);
};

export const splitRoutePath = (filePath: string) =>
  path
    .normalize(filePath)
    .split(path.sep)
    .filter((x) => x.trim().length);

export const normalizeRouteSegment = (segment: string) => {
  const WildcardRegex = /\[\.\.\.\]/g;
  if (WildcardRegex.test(segment)) {
    return "*";
  }
  const ParamRegex = /\[([^\]]+)\]/g;
  const [paramPath] = segment.matchAll(ParamRegex);
  if (paramPath) {
    return ":" + paramPath[1];
  }
  return segment;
};

export const isIndexFile = (filePath: string) =>
  path.matchesGlob(filePath, "**/index.ts{x,}");

export const filePathToRouteSegments = (filePath: string) => {
  const strippedPath = stripExtension(filePath);
  const segments = splitRoutePath(strippedPath);
  const normalizedSegments = segments.map(normalizeRouteSegment);
  if (!isIndexFile(filePath)) {
    return normalizedSegments;
  }
  return normalizedSegments.slice(0, -1);
};
