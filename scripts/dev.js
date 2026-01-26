#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import esbuild from "esbuild";
import { createRequire } from "node:module";

const {
  values: { format },
  positionals,
} = parseArgs({
  options: {
    format: {
      type: "string",
      short: "f",
      default: "esm",
    },
  },
  allowPositionals: true,
});

// 创建 esm 的 __filename
const __filename = fileURLToPath(import.meta.url);
// 创建 esm 的 __dirname
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

const target = positionals.length ? positionals[0] : "vue";

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

esbuild
  .context({
    entryPoints: [entry],
    platform: format === "cjs" ? "node" : "browser",
    bundle: true,
    sourcemap: true,
    format: format, // 打包格式 esm cjs iife
    outfile: resolve(
      __dirname,
      `../packages/${target}/dist/${target}.${format}.js`, // 打包输出文件
    ),
  })
  .then((ctx) => ctx.rebuild())
  .then(() => {
    console.log(`build success`);
  });
