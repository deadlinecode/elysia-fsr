import {
  RouteNode,
  RouterOptions,
  RouteTree,
  ScanResult,
  ScanResultStatus,
} from "./types";
import fs from "fs/promises";
import path from "path";
import prettier from "prettier";

const renderNodes = (
  children: RouteNode[],
  modMap: Map<string, string>
): string => {
  const res = children
    .map((node) => {
      const res = node.files
        .map((file) => `(typeof ${modMap.get(file)!})["~Routes"]`)
        .concat(
          node.children.size
            ? renderNodes(Array.from(node.children.values()), modMap)
            : []
        )
        .join(" & ");
      if (node.kind === "root") return res;
      return `\n"${node.segment}": ${res}`;
    })
    .join();
  if (children.length === 1 && children[0]?.kind === "root") return res;
  return `{${res}}`;
};

export const buildTypeSource = async (
  tree: RouteTree,
  results: ScanResult[],
  importAlias = "./routes/"
) => {
  const modMap = new Map<string, string>(
    results
      .filter((res) => res.status === ScanResultStatus.Loaded)
      .map((res, i) => [res.filePath, `Route${i}`])
  );
  return await prettier.format(
    `
import type {
    Elysia,
    SingletonBase,
    DefinitionBase,
    MetadataBase,
  } from "elysia";

${Array.from(modMap.entries())
  .map(
    ([filePath, importName]) =>
      `import ${importName} from "${importAlias}${filePath}";`
  )
  .join("\n")}

export type App = Elysia<
    string,
    SingletonBase,
    DefinitionBase,
    MetadataBase,
    ${renderNodes([tree.root], modMap)}
  >`,
    {
      parser: "typescript",
    }
  );
};

export const writeTypeFile = async (outputFilePath: string, source: string) => {
  const outputDir = path.dirname(outputFilePath);
  if (!(await fs.exists(outputDir)))
    await fs.mkdir(outputDir, { recursive: true });
  await Bun.write(outputFilePath, source);
};

export const emitRouteTypes = async (
  tree: RouteTree,
  results: ScanResult[],
  options: RouterOptions
) => {
  if (!options.types) return;
  let importAlias;
  let fileDir = "";
  if (typeof options.types === "object") {
    fileDir = options.types.dir;
    if (options.types.importAlias) {
      importAlias = options.types.importAlias;
    }
  } else {
    fileDir = path.join(options.dir, "..");
  }
  if (!importAlias) {
    importAlias = path.relative(fileDir, options.dir) + "/";
    if (!importAlias.startsWith("..")) importAlias = "./" + importAlias;
  }
  const types = await buildTypeSource(tree, results, importAlias);
  await writeTypeFile(path.join(fileDir, "routes.d.ts"), types);
};
