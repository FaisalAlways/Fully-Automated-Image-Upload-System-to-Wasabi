import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mainRouter from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from TypeScript + Node.js!");
});
// Routes
app.use("/", mainRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
