import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";

// Install Remix globals
installGlobals();

const app = express();

// Serve static files
app.use(express.static("public"));

// Handle Remix requests
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/index.js"),
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
