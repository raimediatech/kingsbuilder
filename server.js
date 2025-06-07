import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";

// Install Remix globals
installGlobals();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Redirect root to /app
app.get("/", (req, res) => {
  res.redirect("/app");
});

// Handle Remix requests
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/index.js"),
  })
);

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
