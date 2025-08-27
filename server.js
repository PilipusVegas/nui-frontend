import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// folder build React (Vite = "dist", CRA = "build")
const buildPath = join(__dirname, "build");

// serve file statis
app.use(express.static(buildPath));

// fallback ke index.html (SPA React)
app.get("/*", (req, res) => {
  res.sendFile(join(buildPath, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ React app running on http://localhost:${port}`);
});
