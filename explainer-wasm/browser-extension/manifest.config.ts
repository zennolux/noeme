import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  permissions: ["sidePanel", "contentSettings", "webRequest", "storage"],
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
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  content_security_policy: {
    extension_pages:
      "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' https://then.dpdns.org; media-src 'self' https://bing.com https://*.bing.com;",
  },
  host_permissions: ["https://then.dpdns.org/*", "https://bing.com/*"],
  web_accessible_resources: [
    {
      resources: ["assets/*.wasm", "assets/*.js", "assets/*.css"],
      matches: ["<all_urls>"],
    },
  ],
});
