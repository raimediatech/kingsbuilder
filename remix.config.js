/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.js",
  serverBuildPath: "api/build/index.js",
  serverModuleFormat: "esm",
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  future: {},
};
