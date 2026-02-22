import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("snippets.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    title TEXT,
    code TEXT,
    language TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/publish", (req, res) => {
    const { id, title, code, language } = req.body;
    if (!id || !code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare("INSERT INTO snippets (id, title, code, language) VALUES (?, ?, ?, ?)");
      stmt.run(id, title || "Untitled Snippet", code, language || "plaintext");
      res.json({ success: true, url: `/p/${id}` });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to publish snippet" });
    }
  });

  app.get("/api/snippet/:id", (req, res) => {
    const { id } = req.params;
    const snippet = db.prepare("SELECT * FROM snippets WHERE id = ?").get(id);
    if (!snippet) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    res.json(snippet);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
