import { $ } from "bun";
import fs from "fs/promises";

await fs.rm("dist", { recursive: true, force: true });

await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  format: "esm",
  target: "bun",
  external: ["elysia", "prettier"],
});

await $`bunx tsc -p tsconfig.build.json`;
