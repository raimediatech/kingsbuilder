/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.js",
  serverBuildPath: "build/index.js",
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  future: {},
};
