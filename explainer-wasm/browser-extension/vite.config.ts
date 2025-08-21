import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";
import wasm from "vite-plugin-wasm";
import manifest from "./manifest.config.js";
import { name, version } from "./package.json";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": `${path.resolve(__dirname, "src")}`,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    crx({ manifest }),
    zip({ outDir: "release", outFileName: `crx-${name}-${version}.zip` }),
    {
      name: "wasm-path-transform",
      transform(code, id) {
        // 只在第三方包中处理，避免影响manifest
        if (id.includes("node_modules") && code.includes(".wasm")) {
          // 更安全的替换方式 - 只替换明显的WASM文件路径
          return code.replace(
            /(?:fetch|import|require)\(['"](.*?\.wasm)['"]\)/g,
            (match, wasmPath) => {
              return match.replace(
                wasmPath,
                `chrome.runtime.getURL('${wasmPath}')`
              );
            }
          );
        }
        return code;
      },
    },
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
