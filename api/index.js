// api/index.js
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Install Remix globals
installGlobals();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Serve public files
app.use(express.static(path.join(__dirname, "..", "public")));

// Create Remix request handler
const remixHandler = createRequestHandler({
  build: path.join(__dirname, "..", "build"),
  mode: process.env.NODE_ENV
});

// Handle all requests with Remix
app.all("*", remixHandler);

export default app;
