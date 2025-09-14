import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  permissions: [
    "contentSettings",
    "webRequest",
    "storage",
    "offscreen",
    "tabs",
    "activeTab",
    "scripting",
  ],
  content_scripts: [
    {
      js: ["src/content/main.tsx"],
      matches: ["https://*/*"],
    },
  ],
  background: {
    service_worker: "src/background/worker.ts",
    type: "module",
  },
  content_security_policy: {
    extension_pages:
      "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' https://cn.bing.com; media-src 'self' https://cn.bing.com",
  },
  host_permissions: ["https://cn.bing.com/*"],
  web_accessible_resources: [
    {
      resources: ["assets/*.wasm", "assets/*.js", "assets/*.css"],
      matches: ["<all_urls>"],
    },
  ],
});
